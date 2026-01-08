from fastapi import APIRouter, Request, Body, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy import text
from app.config.database import SessionLocal
from app.services.promethee_engine import compute_promethee

router = APIRouter()
templates = Jinja2Templates(directory="templates")

# ==============================
# UI PAGE
# ==============================
@router.get("/patients-page", response_class=HTMLResponse)
def patients_page(request: Request):
    return templates.TemplateResponse("patients.html", {"request": request})

# ==============================
# API: CRUD PATIENTS
# ==============================
@router.get("/api/patients")
def api_get_patients():
    db = SessionLocal()
    try:
        # Join with alternatives to get recommended hospital Name
        query = text("""
            SELECT p.*, a.name as recommended_hospital 
            FROM patients p 
            LEFT JOIN alternatives a ON p.recommended_alt_id = a.id
            ORDER BY p.id DESC
        """)
        rows = db.execute(query).mappings().all()
        return {"patients": list(rows)}
    finally:
        db.close()

@router.post("/api/patients")
def api_create_patient(payload: dict = Body(...)):
    """
    payload: {name, age, gender, condition_notes}
    """
    db = SessionLocal()
    try:
        db.execute(text("""
            INSERT INTO patients (name, age, gender, condition_notes)
            VALUES (:name, :age, :gender, :condition_notes)
        """), {
            "name": payload.get("name"),
            "age": payload.get("age"),
            "gender": payload.get("gender"),
            "condition_notes": payload.get("condition_notes", "")
        })
        db.commit()
        return {"status": "created"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@router.delete("/api/patients/{patient_id}")
def api_delete_patient(patient_id: int):
    db = SessionLocal()
    try:
        db.execute(text("DELETE FROM patients WHERE id=:id"), {"id": patient_id})
        db.commit()
        return {"status": "deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

# ==============================
# API: PATIENT REFERRAL PROCESS
# ==============================
import json

@router.post("/api/patients/referral")
def api_process_referral(payload: dict = Body(...)):
    """
    payload: {
        "user_data": {name, age, gender, condition_notes},
        "custom_weights": { criteria_id: weight_value }
    }
    """
    # 1. Compute PROMETHEE
    custom_weights = payload.get("custom_weights", {})
    if not custom_weights:
        raise HTTPException(status_code=400, detail="Data kondisi belum lengkap.")

    try:
        results_data = compute_promethee(custom_weights=custom_weights)
        if "error" in results_data:
            raise HTTPException(status_code=400, detail=results_data["error"])
        
        # Get Top Rank (Rank 1)
        # results_data['results'] is sorted by rank 1 first
        top_result = results_data['results'][0]
        
        # Find Alternative ID for top rank (we need ID, but result has code/name)
        # We need to map code back to ID or fetch from 'results' if we modify compute_promethee to return IDs
        # compute_promethee manual mode returns "results" list. 
        # But wait, compute_promethee result structure in manual mode doesn't include "id", only "code" and "name". 
        # Let's quickly query ID for the code. This is a bit inefficient but safe.
        db = SessionLocal()
        top_alt_code = top_result['code']
        top_alt_row = db.execute(text("SELECT id FROM alternatives WHERE code=:code"), {"code": top_alt_code}).mappings().first()
        top_alt_id = top_alt_row['id'] if top_alt_row else None
        
        # 2. Save Patient
        user_data = payload.get("user_data", {})
        
        # Insert Patient with Referral info
        cursor = db.execute(text("""
            INSERT INTO patients (name, age, gender, condition_notes, recommended_alt_id, input_data)
            VALUES (:name, :age, :gender, :notes, :rec_id, :input_json)
        """), {
            "name": user_data.get("name"),
            "age": user_data.get("age"),
            "gender": user_data.get("gender"),
            "notes": user_data.get("condition_notes", ""),
            "rec_id": top_alt_id,
            "input_json": json.dumps(custom_weights)
        })
        db.commit()
        
        # Get new patient ID (last_insert_id logic varies, let's select max id for simplicity in this context or cursor.lastrowid if supported)
        # In SQLAlchemy with execute, getting last id can be tricky depending on driver.
        # Let's fetch latest
        new_patient = db.execute(text("SELECT id FROM patients ORDER BY id DESC LIMIT 1")).mappings().first()
        new_pid = new_patient['id']
        
        db.close()
        
        return {"status": "success", "redirect_url": f"/report/{new_pid}"}
        
    except Exception as e:
        print(f"Referral Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/report/{patient_id}", response_class=HTMLResponse)
def view_patient_report(patient_id: int, request: Request):
    db = SessionLocal()
    try:
        # Fetch Patient
        patient = db.execute(text("""
            SELECT p.*, a.name as hospital_name, a.code as hospital_code
            FROM patients p
            LEFT JOIN alternatives a ON p.recommended_alt_id = a.id
            WHERE p.id = :id
        """), {"id": patient_id}).mappings().first()
        
        if not patient:
            raise HTTPException(status_code=404, detail="Patient not found")
        
        # Decode Input Data (Conditions)
        input_data = {}
        if patient['input_data']:
            try:
                raw_inputs = json.loads(patient['input_data']) # {cid: val}
                # Fetch Criteria Names to display nicely
                criteria_rows = db.execute(text("SELECT id, name FROM criteria")).mappings().all()
                crit_map = {str(c['id']): c['name'] for c in criteria_rows}
                
                # Fetch Parameters to show "Category Name" (e.g. "Parah") instead of value "90"
                # This requires fetching parameters implementation. For now showing value is OK, but names are better.
                # Let's fetch all params
                params_rows = db.execute(text("SELECT * FROM criteria_parameters")).mappings().all()
                # Map value to name for specific cid? {cid: {val: name}}
                # Note: floating point values in JSON vs DB might mismatch. Need close appx.
                
                param_lookup = {}
                for p in params_rows:
                    cid = str(p['criteria_id'])
                    v = float(p['value'])
                    if cid not in param_lookup: param_lookup[cid] = {}
                    param_lookup[cid][v] = p['name']

                for cid, val in raw_inputs.items():
                    c_name = crit_map.get(str(cid), f"Unknown ({cid})")
                    
                    # Try to find parameter name
                    val_float = float(val)
                    # Find closest match or exact
                    param_name = str(val) # default
                    if str(cid) in param_lookup:
                        # try exact
                        if val_float in param_lookup[str(cid)]:
                             param_name = f"{param_lookup[str(cid)][val_float]} ({val})"
                        else:
                             # try approx
                             for pv, pn in param_lookup[str(cid)].items():
                                 if abs(pv - val_float) < 0.001:
                                     param_name = f"{pn} ({val})"
                                     break
                    
                    input_data[c_name] = param_name

            except Exception as e:
                print(f"Error parsing input data: {e}")
                input_data = {"Error": "Corrupt Data"}

        return templates.TemplateResponse("patient_report.html", {
            "request": request,
            "patient": patient,
            "conditions": input_data
        })

    finally:
        db.close()

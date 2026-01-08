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
        rows = db.execute(text("SELECT * FROM patients ORDER BY id DESC")).mappings().all()
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
# API: RECOMMENDATION
# ==============================
@router.post("/api/recommend")
def api_recommend_hospitals(payload: dict = Body(...)):
    """
    payload: {
        "custom_weights": { "criteria_id": weight_value, ... }
    }
    """
    custom_weights = payload.get("custom_weights", {})
    
    # Validation: weights should be provided for meaningful recommendation
    if not custom_weights:
        # If no custom weights, user might want default ones OR prompted to fill
        pass

    try:
        result = compute_promethee(custom_weights=custom_weights)
        if "error" in result:
             raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import FastAPI, Request, Body
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from sqlalchemy import text
from app.config.database import engine, SessionLocal
from app.services.promethee_engine import compute_promethee
from app.routes import patients

app = FastAPI()

app.include_router(patients.router)

# Mount Static & Templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
def root(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})

@app.get("/db-test")
def db_test():
    try:
        conn = engine.connect()
        conn.close()
        return {"db_status": "CONNECTED"}
    except Exception as e:
        return {"db_status": "ERROR", "detail": str(e)}

# ==============================
# UI PAGES
# ==============================
@app.get("/dashboard", response_class=HTMLResponse)
def dashboard(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})

# ==============================
# HITUNG PROMETHEE
# ==============================
@app.post("/compute/promethee")
def run_promethee():
    return compute_promethee()

# ==============================
# AMBIL HASIL
# ==============================
@app.get("/results")
def get_results():
    db = SessionLocal()
    try:
        # Query join table flows & alternatives
        query = text("""
            SELECT 
                f.ranking, 
                a.code, 
                a.name, 
                f.leaving_flow, 
                f.entering_flow, 
                f.net_flow
            FROM flows f
            JOIN alternatives a ON f.alternative_id = a.id
            ORDER BY f.ranking ASC
        """)
        
        rows = db.execute(query).mappings().all()
        return {"results": list(rows)}
    except Exception as e:
        return {"error": str(e)}
    finally:
        db.close()

# ==============================
# UI PAGE: ALTERNATIVES
# ==============================
@app.get("/alternatives-page", response_class=HTMLResponse)
def alternatives_page(request: Request):
    return templates.TemplateResponse("alternatives.html", {"request": request})

# ==============================
# API: CRUD ALTERNATIVES
# ==============================
@app.get("/api/alternatives")
def api_get_alternatives():
    db = SessionLocal()
    rows = db.execute(text("SELECT * FROM alternatives ORDER BY id ASC")).mappings().all()
    db.close()
    return {"alternatives": list(rows)}

@app.post("/api/alternatives")
def api_create_alternative(payload: dict = Body(...)):
    db = SessionLocal()
    db.execute(text("""
        INSERT INTO alternatives (code, name)
        VALUES (:code, :name)
    """), {
        "code": payload.get("code"),
        "name": payload.get("name")
    })
    db.commit()
    db.close()
    return {"status": "created"}

@app.put("/api/alternatives/{alt_id}")
def api_update_alternative(alt_id: int, payload: dict = Body(...)):
    db = SessionLocal()
    db.execute(text("""
        UPDATE alternatives
        SET code=:code, name=:name
        WHERE id=:id
    """), {
        "id": alt_id,
        "code": payload.get("code"),
        "name": payload.get("name")
    })
    db.commit()
    db.close()
    return {"status": "updated"}

@app.delete("/api/alternatives/{alt_id}")
def api_delete_alternative(alt_id: int):
    db = SessionLocal()
    # Hapus scores & flows terkait agar tidak orphan/error di engine
    db.execute(text("DELETE FROM scores WHERE alternative_id=:id"), {"id": alt_id})
    db.execute(text("DELETE FROM flows WHERE alternative_id=:id"), {"id": alt_id})
    
    db.execute(text("DELETE FROM alternatives WHERE id=:id"), {"id": alt_id})
    db.commit()
    db.close()
    return {"status": "deleted"}


# ==============================
# UI PAGE: KRITERIA
# ==============================
@app.get("/criteria-page", response_class=HTMLResponse)
def criteria_page(request: Request):
    return templates.TemplateResponse("criteria.html", {"request": request})



@app.get("/parameters-page", response_class=HTMLResponse)
def parameters_page(request: Request):
    return templates.TemplateResponse("parameters.html", {"request": request})

# ==============================
# API: CRUD KRITERIA
# ==============================
@app.get("/api/criteria")
def api_get_criteria():
    db = SessionLocal()
    rows = db.execute(text("SELECT * FROM criteria ORDER BY id ASC")).mappings().all()
    db.close()
    return {"criteria": list(rows)}

@app.post("/api/criteria")
def api_create_criteria(payload: dict = Body(...)):
    """
    payload: {code, name, weight, type}
    """
    db = SessionLocal()
    db.execute(text("""
        INSERT INTO criteria (code, name, weight, type)
        VALUES (:code, :name, :weight, :type)
    """), {
        "code": payload.get("code"),
        "name": payload.get("name"),
        "weight": float(payload.get("weight", 0)),
        "type": payload.get("type", "benefit"),
    })
    db.commit()
    db.close()
    return {"status": "created"}

@app.put("/api/criteria/{criteria_id}")
def api_update_criteria(criteria_id: int, payload: dict = Body(...)):
    db = SessionLocal()
    db.execute(text("""
        UPDATE criteria
        SET code=:code, name=:name, weight=:weight, type=:type
        WHERE id=:id
    """), {
        "id": criteria_id,
        "code": payload.get("code"),
        "name": payload.get("name"),
        "weight": float(payload.get("weight", 0)),
        "type": payload.get("type", "benefit"),
    })
    db.commit()
    db.close()
    return {"status": "updated"}

@app.delete("/api/criteria/{criteria_id}")
def api_delete_criteria(criteria_id: int):
    db = SessionLocal()
    db.execute(text("DELETE FROM criteria WHERE id=:id"), {"id": criteria_id})
    db.commit()
    db.close()
    return {"status": "deleted"}


# ==============================
# API: CRUD CRITERIA PARAMETERS
# ==============================
@app.get("/api/criteria/{criteria_id}/parameters")
def api_get_criteria_parameters(criteria_id: int):
    db = SessionLocal()
    rows = db.execute(text("SELECT * FROM criteria_parameters WHERE criteria_id=:cid ORDER BY value DESC"), {"cid": criteria_id}).mappings().all()
    db.close()
    return {"parameters": list(rows)}

@app.post("/api/criteria/{criteria_id}/parameters")
def api_create_criteria_parameter(criteria_id: int, payload: dict = Body(...)):
    db = SessionLocal()
    db.execute(text("""
        INSERT INTO criteria_parameters (criteria_id, name, value)
        VALUES (:cid, :name, :value)
    """), {
        "cid": criteria_id,
        "name": payload.get("name"),
        "value": float(payload.get("value", 0))
    })
    db.commit()
    db.close()
    return {"status": "created"}

@app.delete("/api/parameters/{param_id}")
def api_delete_criteria_parameter(param_id: int):
    db = SessionLocal()
    db.execute(text("DELETE FROM criteria_parameters WHERE id=:id"), {"id": param_id})
    db.commit()
    db.close()
    return {"status": "deleted"}

# ==============================
# UI PAGE: SCORES
# ==============================
@app.get("/scores-page", response_class=HTMLResponse)
def scores_page(request: Request):
    return templates.TemplateResponse("scores.html", {"request": request})


# ==============================
# API: AMBIL DATA UNTUK TABEL SCORES
# ==============================
@app.get("/api/scores-matrix")
def api_get_scores_matrix():
    db = SessionLocal()

    criteria = db.execute(text("SELECT id, code, name FROM criteria ORDER BY id")).mappings().all()
    alternatives = db.execute(text("SELECT id, code, name FROM alternatives ORDER BY id")).mappings().all()
    scores = db.execute(text("""
        SELECT alternative_id, criteria_id, value
        FROM scores
    """)).mappings().all()
    
    # Fetch parameters
    params_rows = db.execute(text("SELECT * FROM criteria_parameters ORDER BY value DESC")).mappings().all()
    
    # Group params by criteria_id
    parameters_map = {}
    for p in params_rows:
        cid = p["criteria_id"]
        if cid not in parameters_map:
            parameters_map[cid] = []
        parameters_map[cid].append(dict(p))

    db.close()

    return {
        "criteria": list(criteria),
        "alternatives": list(alternatives),
        "scores": list(scores),
        "parameters": parameters_map
    }


# ==============================
# API: SIMPAN SCORES (UPSERT)
# ==============================
@app.post("/api/scores")
def api_save_scores(payload: dict = Body(...)):
    """
    payload:
    {
      "values": [
        {"alternative_id":1,"criteria_id":2,"value":80},
        ...
      ]
    }
    """
    db = SessionLocal()

    for item in payload.get("values", []):
        # cek apakah sudah ada
        exists = db.execute(text("""
            SELECT id FROM scores
            WHERE alternative_id=:a AND criteria_id=:c
        """), {"a": item["alternative_id"], "c": item["criteria_id"]}).first()

        if exists:
            db.execute(text("""
                UPDATE scores SET value=:v
                WHERE alternative_id=:a AND criteria_id=:c
            """), {
                "v": float(item["value"]),
                "a": item["alternative_id"],
                "c": item["criteria_id"]
            })
        else:
            db.execute(text("""
                INSERT INTO scores (alternative_id, criteria_id, value)
                VALUES (:a, :c, :v)
            """), {
                "a": item["alternative_id"],
                "c": item["criteria_id"],
                "v": float(item["value"])
            })

    db.commit()
    db.close()
    return {"status": "scores saved"}

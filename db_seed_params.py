import sys
import os
sys.path.append(os.getcwd())

from app.config.database import SessionLocal
from sqlalchemy import text

def seed_params():
    db = SessionLocal()
    try:
        print("Clearing existing parameters...")
        db.execute(text("TRUNCATE TABLE criteria_parameters"))
        
        params = [
            # C1: Keparahan Penyakit
            {"cid": 1, "name": "Sangat Ringan", "value": 40},
            {"cid": 1, "name": "Ringan", "value": 50},
            {"cid": 1, "name": "Cukup Sedang", "value": 70},
            {"cid": 1, "name": "Sedang", "value": 82},
            {"cid": 1, "name": "Parah", "value": 88},
            {"cid": 1, "name": "Sangat Parah", "value": 90},

            # C2: Fasilitas Puskesmas
            {"cid": 2, "name": "Sangat Minim", "value": 40},
            {"cid": 2, "name": "Minim", "value": 50},
            {"cid": 2, "name": "Sedikit Lengkap", "value": 60},
            {"cid": 2, "name": "Cukup Lengkap", "value": 70},
            {"cid": 2, "name": "Lengkap", "value": 80},

            # C3: Jarak RS Rujukan
            {"cid": 3, "name": "< 5 km", "value": 1},
            {"cid": 3, "name": "5 - 10 km", "value": 2},
            {"cid": 3, "name": "10 - 15 km", "value": 3},
            {"cid": 3, "name": "15 - 20 km", "value": 4},
            {"cid": 3, "name": "20 - 25 km", "value": 5},
            {"cid": 3, "name": "> 25 km", "value": 6},

            # C4: Kompetensi Nakes
            {"cid": 4, "name": "Tidak Berpengalaman", "value": 40},
            {"cid": 4, "name": "Minim Pengalaman", "value": 50},
            {"cid": 4, "name": "Cukup Berpengalaman", "value": 65},
            {"cid": 4, "name": "Kurang Berpengalaman", "value": 75},
            {"cid": 4, "name": "Berpengalaman", "value": 80},
            {"cid": 4, "name": "Sangat Berpengalaman", "value": 90},

            # C5: Ketersediaan TT RS
            {"cid": 5, "name": "< 20 TT", "value": 45},
            {"cid": 5, "name": "20 - 29 TT", "value": 55},
            {"cid": 5, "name": "30 - 39 TT", "value": 60},
            {"cid": 5, "name": "40 - 49 TT", "value": 70},
            {"cid": 5, "name": "50 - 60 TT", "value": 80},

            # C6: Ekonomi Pasien
            {"cid": 6, "name": "Sangat tidak mampu", "value": 1},
            {"cid": 6, "name": "Kurang mampu", "value": 2},
            {"cid": 6, "name": "Menengah", "value": 3},
            {"cid": 6, "name": "Menengah atas", "value": 4},
            {"cid": 6, "name": "Mampu", "value": 5},
            {"cid": 6, "name": "Sangat mampu", "value": 6},
        ]

        print("Inserting new parameters...")
        for p in params:
            db.execute(text("""
                INSERT INTO criteria_parameters (criteria_id, name, value)
                VALUES (:cid, :name, :value)
            """), p)
        
        db.commit()
        print("Done!")

    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_params()

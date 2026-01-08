import numpy as np
import pandas as pd
from app.config.database import SessionLocal
from sqlalchemy import text


def compute_promethee(custom_weights: dict = None):
    """
    custom_weights: dict {criteria_id: float_weight}
    If provided, use these weights instead of DB weights, and DO NOT save to DB.
    Return the ranked results directly.
    """
    db = SessionLocal()
    try:
        # ==============================
        # 1. AMBIL DATAS
        # ==============================
        criteria_rows = db.execute(text("SELECT * FROM criteria")).mappings().all()
        alternatives = db.execute(text("SELECT * FROM alternatives")).mappings().all()
        scores = db.execute(text("""
            SELECT alternative_id, criteria_id, value 
            FROM scores
        """)).mappings().all()

        if not criteria_rows or not alternatives or not scores:
            return {"error": "Data kriteria, alternatif, atau nilai belum lengkap."}

        # Convert criteria_rows to mutable list/dict to apply custom weights
        # We also need to keep the structure
        criteria = []
        for c in criteria_rows:
            c_dict = dict(c)
            # Apply custom weight if exists
            if custom_weights and str(c_dict["id"]) in custom_weights:
                 c_dict["weight"] = float(custom_weights[str(c_dict["id"])])
            elif custom_weights and c_dict["id"] in custom_weights: # handle int key
                 c_dict["weight"] = float(custom_weights[c_dict["id"]])
            
            criteria.append(c_dict)

        # Tutup session baca dulu (opsional, tapi biar hemat koneksi)
        db.close()

        alt_ids = [a["id"] for a in alternatives]
        crit_ids = [c["id"] for c in criteria if c["id"]] # ensure valid ids

        # ==============================
        # MATRIX NILAI MENTAH
        # ==============================
        matrix = pd.DataFrame(index=alt_ids, columns=crit_ids)
        for row in scores:
             # Only fill if crit_id exists (in case scores has old criteria)
            if row["criteria_id"] in crit_ids:
                matrix.loc[row["alternative_id"], row["criteria_id"]] = float(row["value"])
        
        matrix = matrix.astype(float)

        # ==============================
        # 4. NORMALISASI
        # ==============================
        normalized = matrix.copy()
        for c in criteria:
            cid = c["id"]
            if cid not in matrix.columns: continue
            
            col = matrix[cid]
            min_val = col.min()
            max_val = col.max()
            
            diff = max_val - min_val

            if diff == 0:
                # Jika semua nilai sama, normalized = 0
                normalized[cid] = 0.0
            else:
                if c["type"] == "benefit":
                    normalized[cid] = (col - min_val) / diff
                else:  # cost
                    normalized[cid] = (max_val - col) / diff

        # ==============================
        # 5. PREFERENSI
        # ==============================
        preference = {}
        for a in alt_ids:
            for b in alt_ids:
                if a == b: continue
                
                pref_sum = 0
                for c in criteria:
                    cid = c["id"]
                    if cid not in normalized.columns: continue

                    w = float(c["weight"])
                    
                    val_a = normalized.loc[a, cid]
                    val_b = normalized.loc[b, cid]
                    
                    # Guard against NaN if any slipped through
                    if pd.isna(val_a): val_a = 0.0
                    if pd.isna(val_b): val_b = 0.0

                    d = val_a - val_b
                    P = 0 if d <= 0 else d
                    pref_sum += w * P
                
                preference[(a, b)] = pref_sum

        # ==============================
        # 6. FLOW
        # ==============================
        n = len(alt_ids)
        flows = {}
        if n > 1:
            for a in alt_ids:
                leaving = sum(preference[(a, b)] for b in alt_ids if a != b) / (n - 1)
                entering = sum(preference[(b, a)] for b in alt_ids if a != b) / (n - 1)
                net = leaving - entering
                flows[a] = {"leaving": round(leaving, 6), "entering": round(entering, 6), "net": round(net, 6)}
        else:
            # Jika cuma 1 alternatif, flows 0 semua
            for a in alt_ids:
                flows[a] = {"leaving": 0.0, "entering": 0.0, "net": 0.0}

        # ==============================
        # 7. RANKING
        # ==============================
        sorted_flow = sorted(flows.items(), key=lambda x: x[1]["net"], reverse=True)
        rank_result = {alt_id: i+1 for i, (alt_id, _) in enumerate(sorted_flow)}

        # If custom_weights, return result directly
        if custom_weights:
            results = []
            for alt_id, flow_data in sorted_flow:
                # Find alternative data
                alt_data = next((a for a in alternatives if a["id"] == alt_id), None)
                results.append({
                    "ranking": rank_result[alt_id],
                    "code": alt_data["code"] if alt_data else "",
                    "name": alt_data["name"] if alt_data else "",
                    "net_flow": flow_data["net"],
                    "entering_flow": flow_data["entering"],
                    "leaving_flow": flow_data["leaving"]
                })
            return {"results": results}

        # ==============================
        # 8. SIMPAN KE DATABASE (Global Only)
        # ==============================
        # Buka koneksi baru khusus write
        db_write = SessionLocal()
        try:
            db_write.execute(text("DELETE FROM flows"))
            
            for alt_id, data in flows.items():
                def safe_float(v):
                    if pd.isna(v) or np.isnan(v):
                        return 0.0
                    return float(v)

                db_write.execute(text("""
                    INSERT INTO flows (alternative_id, leaving_flow, entering_flow, net_flow, ranking)
                    VALUES (:alt_id, :leaving, :entering, :net, :ranking)
                """), {
                    "alt_id": alt_id,
                    "leaving": safe_float(data["leaving"]),
                    "entering": safe_float(data["entering"]),
                    "net": safe_float(data["net"]),
                    "ranking": rank_result[alt_id]
                })
            
            db_write.commit()
            return {"status": "PROMETHEE selesai dihitung & disimpan"}
        except Exception as e:
            db_write.rollback()
            raise e
        finally:
            db_write.close()


    except Exception as e:
        print(f"Error computing promethee: {e}")
        return {"error": str(e)}
    finally:
        # Pastikan session pertama juga tutup
        # karena db.close() dipanggil manual di atas, kita cek dulu
        # Note: SQLAlchemy session safe to close multiple times usually, but let's be cleaner.
        # Since we assigned variable `db`, we can strictly checking or just try close.
        try:
            db.close()
        except:
            pass

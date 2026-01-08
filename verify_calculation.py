import pandas as pd
import numpy as np
import sys
import os

sys.path.append(os.getcwd())
from app.config.database import SessionLocal
from sqlalchemy import text

def calculate_manually():
    db = SessionLocal()
    
    # 1. Fetch Data
    criteria = list(db.execute(text("SELECT * FROM criteria")).mappings().all())
    scores = list(db.execute(text("SELECT * FROM scores")).mappings().all())
    alts = list(db.execute(text("SELECT * FROM alternatives")).mappings().all())
    
    db.close()
    
    print("\n[VERIFICATION] Criteria Weights & Types:")
    c_map = {}
    for c in criteria:
        print(f"  {c['code']}: {c['weight']} ({c['type']})")
        c_map[c['id']] = c

    # 2. Build Matrix
    print("\n[VERIFICATION] Score Matrix:")
    matrix = {} # alt_id -> { crit_id -> val }
    for s in scores:
        if s['alternative_id'] not in matrix: matrix[s['alternative_id']] = {}
        matrix[s['alternative_id']][s['criteria_id']] = float(s['value'])
    
    # Print Matrix for check
    for a in alts:
        row = matrix.get(a['id'], {})
        row_str = ", ".join([f"{c['code']}:{row.get(c['id'], '-')}" for c in criteria])
        print(f"  {a['code']}: {row_str}")

    # 3. Normalize
    # We will use simplified logic to verify
    normalized = {} # alt_id -> { crit_id -> norm_val }
    
    # Find min/max per criteria
    c_stats = {}
    for c in criteria:
        cid = c['id']
        vals = [matrix.get(a['id'], {}).get(cid, 0) for a in alts]
        c_stats[cid] = {'min': min(vals), 'max': max(vals)}
    
    for a in alts:
        aid = a['id']
        normalized[aid] = {}
        for c in criteria:
            cid = c['id']
            val = matrix.get(aid, {}).get(cid, 0)
            mn, mx = c_stats[cid]['min'], c_stats[cid]['max']
            rng = mx - mn
            
            norm = 0
            if rng == 0:
                norm = 0
            else:
                if c['type'] == 'benefit':
                    norm = (val - mn) / rng
                else:
                    norm = (mx - val) / rng
            normalized[aid][cid] = norm

    # 4. Preference (Simple Difference * Weight)
    # Using Usual Criterion (Type 1) implicitly in the code: P(d) = d if d>0 else 0
    # Actually wait, the code does: P = normalized_diff. Wait no.
    # The code: normalized[cid] = (val - min) / diff. This is Min-Max normalization.
    # Then preference sum += w * (norm_a - norm_b) IF > 0.
    # This is equivalent to Promethee II with "Linear Preference" if based on normalized values? 
    # Or is it "Usual" on normalized?
    # Actually, standard Promethee uses Preference Functions on RAW differences.
    # BUT, many implementations normalize first to make standard preference function P(d)=d easier.
    # Let's trace.
    
    flows = {a['id']: {'leaving':0, 'entering':0} for a in alts}
    n = len(alts)
    
    for a in alts:
        aid = a['id']
        for b in alts:
            bid = b['id']
            if aid == bid: continue
            
            pref_ab = 0
            for c in criteria:
                cid = c['id']
                w = float(c['weight'])
                va = normalized[aid][cid]
                vb = normalized[bid][cid]
                diff = va - vb
                if diff > 0:
                    pref_ab += w * diff # This effectively makes it Linear Preference on Normalized Data.
            
            flows[aid]['leaving'] += pref_ab
            flows[bid]['entering'] += pref_ab

    # 5. Finalize
    print("\n[VERIFICATION] Final Flows:")
    results = []
    for a in alts:
        aid = a['id']
        leaving = flows[aid]['leaving'] / (n - 1)
        entering = flows[aid]['entering'] / (n - 1)
        net = leaving - entering
        results.append((a['code'], leaving, entering, net))
    
    # Sort by Net Flow
    results.sort(key=lambda x: x[3], reverse=True)
    
    for r in results:
        print(f"  {r[0]} -> Net: {r[3]:.4f} (Leave: {r[1]:.4f}, Enter: {r[2]:.4f})")

calculate_manually()

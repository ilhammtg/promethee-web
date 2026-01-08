from app.config.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()
res = db.execute(text('SELECT id, code, name, type FROM criteria')).mappings().all()
with open('criteria_dump.txt', 'w') as f:
    for r in res:
        f.write(f"{r['code']} - {r['name']} : {r['type']}\n")
db.close()

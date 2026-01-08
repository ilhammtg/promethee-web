from app.config.database import SessionLocal
from sqlalchemy import text

def fix():
    db = SessionLocal()
    try:
        print("Updating C2 and C4 to benefit...")
        db.execute(text("UPDATE criteria SET type='benefit' WHERE code IN ('C2', 'C4')"))
        db.commit()
        print("Success.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix()

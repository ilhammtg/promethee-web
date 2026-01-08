import sys
import os
sys.path.append(os.getcwd())
from app.config.database import SessionLocal
from sqlalchemy import text

def migrate():
    db = SessionLocal()
    try:
        print("Migrating patients table...")
        
        # Add recommended_alt_id column
        try:
            db.execute(text("ALTER TABLE patients ADD COLUMN recommended_alt_id INT DEFAULT NULL"))
            print("Added column 'recommended_alt_id'")
        except Exception as e:
            print(f"Column 'recommended_alt_id' might already exist: {e}")

        # Add input_data column
        try:
            db.execute(text("ALTER TABLE patients ADD COLUMN input_data TEXT DEFAULT NULL"))
            print("Added column 'input_data'")
        except Exception as e:
            print(f"Column 'input_data' might already exist: {e}")

        # Add FK constraint (Optional, but good for integrity)
        # Note: Handling FKs in raw SQL varies by engine, assuming MySQL/MariaDB here based on user context
        try:
            db.execute(text("ALTER TABLE patients ADD CONSTRAINT fk_patient_referral FOREIGN KEY (recommended_alt_id) REFERENCES alternatives(id) ON DELETE SET NULL"))
            print("Added Foregin Key constraint")
        except Exception as e:
            print(f"FK Constraint might already exist: {e}")

        db.commit()
        print("Migration complete!")
    except Exception as e:
        print(f"Migration failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate()

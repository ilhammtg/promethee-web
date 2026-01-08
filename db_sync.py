import mysql.connector
from app.config.database import DB_HOST, DB_USER, DB_PASS, DB_NAME
import os

def reset_database():
    print("🚀 Starting Database Sync...")
    
    # 1. Connect to MySQL Server (without specifying DB first)
    try:
        conn = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASS
        )
        cursor = conn.cursor()
        print(f"✅ Connected to MySQL at {DB_HOST}")
    except Exception as e:
        print(f"❌ Failed to connect to MySQL: {e}")
        return

    # 2. Re-create Database
    try:
        cursor.execute(f"DROP DATABASE IF EXISTS {DB_NAME}")
        print(f"🗑️  Dropped database '{DB_NAME}' if it existed.")
        
        cursor.execute(f"CREATE DATABASE {DB_NAME}")
        print(f"✨ Created new database '{DB_NAME}'.")
        
        cursor.execute(f"USE {DB_NAME}")
        print(f"📂 Selected database '{DB_NAME}'.")
    except Exception as e:
        print(f"❌ Failed to recreate database: {e}")
        conn.close()
        return

    # 3. Read and Execute SQL Dump
    sql_file = "promethee_db.sql"
    if not os.path.exists(sql_file):
        print(f"❌ SQL file '{sql_file}' not found!")
        conn.close()
        return
    
    print(f"📖 Reading '{sql_file}'...")
    try:
        with open(sql_file, 'r', encoding='utf-8') as f:
            sql_script = f.read()

        # Split by semicolon to get individual commands
        # Note: This is a simple split and might fail on complex stored procedures or strings containing semicolons.
        # However, for a standard mysqldump, it usually works fine if we handle empty lines.
        commands = sql_script.split(';')
        
        count = 0
        for command in commands:
            command = command.strip()
            if command:
                try:
                    cursor.execute(command)
                    count += 1
                except Exception as cmd_err:
                    # Ignore harmless errors like "Table exists" if we just created DB, but here we expect clean run
                    # However, some dumps include comment-only statements that might be parsed weirdly.
                    # We'll print error but continue.
                    print(f"⚠️  Warning executing command: {cmd_err}\nCommand snippet: {command[:50]}...")
        
        conn.commit()
        print(f"✅ Successfully executed {count} SQL commands.")
        
    except Exception as e:
        print(f"❌ Failed to execute SQL script: {e}")
    finally:
        cursor.close()
        conn.close()
        print("🏁 Database Sync Finished.")

if __name__ == "__main__":
    reset_database()

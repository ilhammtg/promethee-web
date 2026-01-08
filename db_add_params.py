import mysql.connector
from app.config.database import DB_HOST, DB_USER, DB_PASS, DB_NAME

def add_parameters_table():
    print("🚀 Adding 'criteria_parameters' table...")
    
    try:
        conn = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASS,
            database=DB_NAME
        )
        cursor = conn.cursor()
        
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS criteria_parameters (
            id INT AUTO_INCREMENT PRIMARY KEY,
            criteria_id INT NOT NULL,
            name VARCHAR(100) NOT NULL,
            value DECIMAL(10, 2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (criteria_id) REFERENCES criteria(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
        """
        
        cursor.execute(create_table_sql)
        conn.commit()
        print("✅ Table 'criteria_parameters' created/verified.")
        
        # Verify it exists
        cursor.execute("SHOW TABLES LIKE 'criteria_parameters'")
        result = cursor.fetchone()
        if result:
            print("👁️ Table exists in database.")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    add_parameters_table()

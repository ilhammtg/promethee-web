from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# GANTI SESUAI KONFIG LARAGON TUAN
DB_HOST = "localhost"
DB_USER = "root"
DB_PASS = ""
DB_NAME = "promethee_db"

DATABASE_URL = f"mysql+mysqlconnector://{DB_USER}:{DB_PASS}@{DB_HOST}/{DB_NAME}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

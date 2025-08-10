from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

SQLALCHEMY_DATABASE_URL = "sqlite:///./notes.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
def init_db():
    Base.metadata.create_all(bind=engine)
    print("Base de données initialisée.")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
def show_tables():
    from sqlalchemy import inspect
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print("Tables créées:", tables)
    return tables        

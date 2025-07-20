from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./feedback_system.db")

# SQLite specific configuration to handle concurrent connections
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, 
        connect_args={
            "check_same_thread": False,
            "timeout": 60,  # Increased timeout to 60 seconds
        },
        pool_timeout=30,
        pool_recycle=-1,
        pool_pre_ping=True,
        pool_size=1,  # Single connection pool for SQLite
        max_overflow=0  # No overflow connections
    )
    
    # Enable WAL mode for better concurrent access
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        # Enable WAL mode for better concurrent access
        cursor.execute("PRAGMA journal_mode=WAL")
        # Set busy timeout
        cursor.execute("PRAGMA busy_timeout=60000")  # 60 seconds
        # Enable foreign keys
        cursor.execute("PRAGMA foreign_keys=ON")
        # Optimize for concurrent access
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.execute("PRAGMA cache_size=1000")
        cursor.execute("PRAGMA temp_store=memory")
        cursor.close()
else:
    # PostgreSQL or other database configuration
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
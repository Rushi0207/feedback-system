#!/usr/bin/env python3
"""
Initialize SQLite database with WAL mode for better concurrent access.
Run this once to set up the database properly.
"""

import sqlite3
import os

def init_wal_mode():
    """Initialize SQLite database with WAL mode."""
    db_path = "feedback_system.db"
    
    print("🔧 Initializing SQLite database with WAL mode...")
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path, timeout=60)
        cursor = conn.cursor()
        
        # Enable WAL mode
        cursor.execute("PRAGMA journal_mode=WAL")
        result = cursor.fetchone()
        print(f"✅ Journal mode set to: {result[0]}")
        
        # Set busy timeout
        cursor.execute("PRAGMA busy_timeout=60000")
        print("✅ Busy timeout set to 60 seconds")
        
        # Enable foreign keys
        cursor.execute("PRAGMA foreign_keys=ON")
        print("✅ Foreign keys enabled")
        
        # Optimize settings
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.execute("PRAGMA cache_size=1000")
        cursor.execute("PRAGMA temp_store=memory")
        print("✅ Performance optimizations applied")
        
        # Verify settings
        cursor.execute("PRAGMA journal_mode")
        journal_mode = cursor.fetchone()[0]
        
        cursor.execute("PRAGMA busy_timeout")
        busy_timeout = cursor.fetchone()[0]
        
        print(f"\n📊 Database Configuration:")
        print(f"   Journal Mode: {journal_mode}")
        print(f"   Busy Timeout: {busy_timeout}ms")
        print(f"   Database Path: {os.path.abspath(db_path)}")
        
        conn.commit()
        conn.close()
        
        print("\n🎉 Database initialized successfully with WAL mode!")
        print("This should significantly improve concurrent access performance.")
        
        return True
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        return False

if __name__ == "__main__":
    init_wal_mode()
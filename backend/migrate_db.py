#!/usr/bin/env python3
"""
Database migration script to add email verification columns.
"""

import sys
import os
from sqlalchemy import text

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import database

def migrate_database():
    """Add email verification columns to existing users table."""
    print("🔄 Starting database migration...")
    
    try:
        with database.engine.connect() as connection:
            # Check if columns already exist
            result = connection.execute(text("PRAGMA table_info(users)"))
            columns = [row[1] for row in result.fetchall()]
            
            print(f"📊 Current columns in users table: {columns}")
            
            # Add missing columns
            migrations = []
            
            if 'is_verified' not in columns:
                migrations.append("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT 0")
                print("➕ Adding is_verified column...")
            
            if 'verification_token' not in columns:
                migrations.append("ALTER TABLE users ADD COLUMN verification_token TEXT")
                print("➕ Adding verification_token column...")
            
            if 'verification_token_expires' not in columns:
                migrations.append("ALTER TABLE users ADD COLUMN verification_token_expires DATETIME")
                print("➕ Adding verification_token_expires column...")
            
            # Execute migrations
            for migration in migrations:
                connection.execute(text(migration))
                connection.commit()
            
            if migrations:
                print(f"✅ Successfully added {len(migrations)} columns!")
                
                # Mark existing demo users as verified
                print("🔧 Marking demo users as verified...")
                demo_emails = ['manager@company.com', 'employee1@company.com', 'employee2@company.com']
                for email in demo_emails:
                    connection.execute(
                        text("UPDATE users SET is_verified = 1 WHERE email = :email"),
                        {"email": email}
                    )
                connection.commit()
                print("✅ Demo users marked as verified!")
            else:
                print("✅ All columns already exist, no migration needed!")
            
            # Verify the migration
            print("\n🔍 Verifying migration...")
            result = connection.execute(text("PRAGMA table_info(users)"))
            new_columns = [row[1] for row in result.fetchall()]
            print(f"📊 Updated columns in users table: {new_columns}")
            
            # Test data access
            result = connection.execute(text("SELECT COUNT(*) FROM users"))
            user_count = result.fetchone()[0]
            print(f"👥 Total users in database: {user_count}")
            
            # Show verification status
            result = connection.execute(text("SELECT email, is_verified FROM users"))
            users = result.fetchall()
            print("\n📋 User verification status:")
            for email, is_verified in users:
                status = "✅ Verified" if is_verified else "❌ Unverified"
                print(f"   • {email}: {status}")
            
            return True
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Database Migration for Email Verification")
    print("=" * 50)
    
    if migrate_database():
        print("\n🎉 Migration completed successfully!")
        print("You can now restart the FastAPI server.")
    else:
        print("\n❌ Migration failed!")
        sys.exit(1)
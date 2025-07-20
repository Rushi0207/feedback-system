#!/usr/bin/env python3
"""
Database health check script for the Feedback System.
"""

import sys
import os
from sqlalchemy import text, inspect

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import database
import models

def check_database_health():
    """Comprehensive database health check."""
    print("🏥 Database Health Check")
    print("=" * 30)
    
    try:
        # Test connection
        print("1. Testing database connection...")
        with database.engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            if result.fetchone()[0] == 1:
                print("   ✅ Connection successful")
            else:
                print("   ❌ Connection test failed")
                return False
        
        # Check if tables exist
        print("\n2. Checking database tables...")
        inspector = inspect(database.engine)
        existing_tables = inspector.get_table_names()
        
        expected_tables = ['users', 'feedback', 'tags', 'feedback_requests', 'feedback_tags']
        
        for table in expected_tables:
            if table in existing_tables:
                print(f"   ✅ Table '{table}' exists")
            else:
                print(f"   ❌ Table '{table}' missing")
        
        # Test data access
        print("\n3. Testing data access...")
        db = database.SessionLocal()
        try:
            # Test each model
            user_count = db.query(models.User).count()
            print(f"   ✅ Users table accessible ({user_count} records)")
            
            feedback_count = db.query(models.Feedback).count()
            print(f"   ✅ Feedback table accessible ({feedback_count} records)")
            
            tag_count = db.query(models.Tag).count()
            print(f"   ✅ Tags table accessible ({tag_count} records)")
            
            request_count = db.query(models.FeedbackRequest).count()
            print(f"   ✅ Feedback requests table accessible ({request_count} records)")
            
        except Exception as e:
            print(f"   ❌ Data access error: {e}")
            return False
        finally:
            db.close()
        
        # Test relationships
        print("\n4. Testing table relationships...")
        db = database.SessionLocal()
        try:
            # Test manager-employee relationship
            managers = db.query(models.User).filter(models.User.role == "manager").first()
            if managers:
                team_count = len(managers.team_members)
                print(f"   ✅ Manager-Employee relationship working ({team_count} team members)")
            
            # Test feedback relationships
            feedback = db.query(models.Feedback).first()
            if feedback:
                print(f"   ✅ Feedback relationships working (manager: {feedback.manager.full_name})")
            
        except Exception as e:
            print(f"   ❌ Relationship test error: {e}")
            return False
        finally:
            db.close()
        
        print("\n🎉 All database health checks passed!")
        return True
        
    except Exception as e:
        print(f"❌ Database health check failed: {e}")
        return False

def show_sample_data():
    """Show sample data from the database."""
    print("\n📊 Sample Data Preview")
    print("=" * 25)
    
    db = database.SessionLocal()
    try:
        # Show users
        print("\n👥 Users:")
        users = db.query(models.User).limit(5).all()
        for user in users:
            print(f"   • {user.full_name} ({user.role}) - {user.email}")
        
        # Show feedback
        print("\n💬 Recent Feedback:")
        feedback = db.query(models.Feedback).limit(3).all()
        for fb in feedback:
            print(f"   • {fb.manager.full_name} → {fb.employee.full_name} ({fb.sentiment})")
        
        # Show tags
        print("\n🏷️  Available Tags:")
        tags = db.query(models.Tag).all()
        for tag in tags:
            print(f"   • {tag.name} ({tag.color})")
            
    except Exception as e:
        print(f"❌ Error showing sample data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    if check_database_health():
        show_sample_data()
    else:
        print("\n❌ Database health check failed!")
        sys.exit(1)
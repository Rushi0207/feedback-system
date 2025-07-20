#!/usr/bin/env python3
"""
Database initialization script for the Feedback System.
This script creates the database tables and populates them with sample data.
"""

import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import database
import models

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def init_database():
    """Initialize the database with tables and sample data."""
    print("🔧 Initializing database...")
    
    # Create all tables
    try:
        models.Base.metadata.create_all(bind=database.engine)
        print("✅ Database tables created successfully!")
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False
    
    # Create a session
    db = database.SessionLocal()
    
    try:
        # Check if data already exists
        existing_users = db.query(models.User).count()
        if existing_users > 0:
            print(f"📊 Database already has {existing_users} users. Skipping sample data creation.")
            return True
        
        print("👤 Creating sample users...")
        
        # Create sample manager
        manager = models.User(
            email="manager@company.com",
            hashed_password=get_password_hash("password123"),
            full_name="John Manager",
            role="manager"
        )
        db.add(manager)
        db.flush()  # Flush to get the ID
        
        # Create sample employees
        employee1 = models.User(
            email="employee1@company.com",
            hashed_password=get_password_hash("password123"),
            full_name="Alice Employee",
            role="employee",
            manager_id=manager.id
        )
        employee2 = models.User(
            email="employee2@company.com",
            hashed_password=get_password_hash("password123"),
            full_name="Bob Employee",
            role="employee",
            manager_id=manager.id
        )
        db.add(employee1)
        db.add(employee2)
        
        print("🏷️  Creating default tags...")
        
        # Create default tags
        default_tags = [
            models.Tag(name="Communication", color="#3B82F6"),
            models.Tag(name="Leadership", color="#10B981"),
            models.Tag(name="Technical Skills", color="#8B5CF6"),
            models.Tag(name="Teamwork", color="#F59E0B"),
            models.Tag(name="Problem Solving", color="#EF4444"),
            models.Tag(name="Time Management", color="#6B7280")
        ]
        for tag in default_tags:
            db.add(tag)
        
        # Commit all changes
        db.commit()
        
        print("✅ Sample data created successfully!")
        print("\n📋 Demo Accounts:")
        print("   Manager: manager@company.com / password123")
        print("   Employee 1: employee1@company.com / password123")
        print("   Employee 2: employee2@company.com / password123")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating sample data: {e}")
        db.rollback()
        return False
    finally:
        db.close()

def test_database_connection():
    """Test the database connection."""
    print("🔍 Testing database connection...")
    
    try:
        # Test basic connection
        with database.engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            if result.fetchone()[0] == 1:
                print("✅ Database connection successful!")
                return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

def show_database_info():
    """Show information about the database."""
    print("\n📊 Database Information:")
    
    db = database.SessionLocal()
    try:
        user_count = db.query(models.User).count()
        manager_count = db.query(models.User).filter(models.User.role == "manager").count()
        employee_count = db.query(models.User).filter(models.User.role == "employee").count()
        feedback_count = db.query(models.Feedback).count()
        tag_count = db.query(models.Tag).count()
        request_count = db.query(models.FeedbackRequest).count()
        
        print(f"   👥 Total Users: {user_count}")
        print(f"   👔 Managers: {manager_count}")
        print(f"   👤 Employees: {employee_count}")
        print(f"   💬 Feedback Entries: {feedback_count}")
        print(f"   🏷️  Tags: {tag_count}")
        print(f"   📝 Feedback Requests: {request_count}")
        
    except Exception as e:
        print(f"❌ Error getting database info: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Feedback System Database Setup")
    print("=" * 40)
    
    # Test connection first
    if not test_database_connection():
        print("❌ Cannot proceed without database connection.")
        sys.exit(1)
    
    # Initialize database
    if init_database():
        show_database_info()
        print("\n🎉 Database setup completed successfully!")
        print("You can now start the FastAPI server with: uvicorn main:app --reload")
    else:
        print("❌ Database setup failed!")
        sys.exit(1)
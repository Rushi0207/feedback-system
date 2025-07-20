from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
import jwt
import os
import secrets
import time
from passlib.context import CryptContext
from dotenv import load_dotenv
import database
import models
import schemas
from email_service import email_service

# Load environment variables
load_dotenv()

# Database retry decorator with session management
def retry_db_operation_with_new_session(max_retries=3, delay=0.1):
    def decorator(func):
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_retries):
                # Create a new database session for each attempt
                db = database.SessionLocal()
                try:
                    result = func(db, *args, **kwargs)
                    db.close()
                    return result
                except (OperationalError, Exception) as e:
                    db.rollback()
                    db.close()
                    last_exception = e
                    if ("database is locked" in str(e) or "PendingRollbackError" in str(e)) and attempt < max_retries - 1:
                        time.sleep(delay * (2 ** attempt))  # Exponential backoff
                        continue
                    raise e
            raise last_exception
        return wrapper
    return decorator

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    database.Base.metadata.create_all(bind=database.engine)
    # Create sample users if they don't exist
    db = database.SessionLocal()
    try:
        if not db.query(models.User).first():
            # Create sample manager
            manager = models.User(
                email="manager@company.com",
                hashed_password=get_password_hash("password123"),
                full_name="John Manager",
                role="manager",
                is_verified=True  # Demo users are pre-verified
            )
            db.add(manager)
            
            # Create sample employees
            employee1 = models.User(
                email="employee1@company.com",
                hashed_password=get_password_hash("password123"),
                full_name="Alice Employee",
                role="employee",
                manager_id=1,
                is_verified=True  # Demo users are pre-verified
            )
            employee2 = models.User(
                email="employee2@company.com",
                hashed_password=get_password_hash("password123"),
                full_name="Bob Employee",
                role="employee",
                manager_id=1,
                is_verified=True  # Demo users are pre-verified
            )
            db.add(employee1)
            db.add(employee2)
            
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
            
            db.commit()
    finally:
        db.close()
    
    yield
    # Shutdown (if needed)

app = FastAPI(title="Feedback System API", version="1.0.0", lifespan=lifespan)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

# Database dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Authentication helpers
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# Routes
@app.post("/auth/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    if not user or not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@app.get("/auth/me", response_model=schemas.User)
def get_current_user_info(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.post("/auth/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    # Find user with this verification token
    user = db.query(models.User).filter(
        models.User.verification_token == token,
        models.User.verification_token_expires > datetime.utcnow()
    ).first()
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")
    
    # Mark user as verified
    user.is_verified = True
    user.verification_token = None
    user.verification_token_expires = None
    db.commit()
    
    return {"message": "Email verified successfully"}

@app.post("/auth/resend-verification")
async def resend_verification_email(email: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email already verified")
    
    # Generate new verification token
    verification_token = email_service.generate_verification_token()
    token_expiry = email_service.get_token_expiry()
    
    user.verification_token = verification_token
    user.verification_token_expires = token_expiry
    db.commit()
    
    # Send verification email
    try:
        await email_service.send_verification_email(
            to_email=user.email,
            full_name=user.full_name,
            verification_token=verification_token
        )
        return {"message": "Verification email sent successfully"}
    except Exception as e:
        print(f"Failed to send verification email: {e}")
        raise HTTPException(status_code=500, detail="Failed to send verification email")

@app.get("/users/team", response_model=list[schemas.User])
def get_team_members(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can view team members")
    
    team_members = db.query(models.User).filter(models.User.manager_id == current_user.id).all()
    return team_members

@app.post("/users", response_model=schemas.User)
async def create_user(user_data: schemas.UserCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can create users")
    
    # Check if email already exists
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate manager_id if provided
    if user_data.manager_id:
        manager = db.query(models.User).filter(models.User.id == user_data.manager_id, models.User.role == "manager").first()
        if not manager:
            raise HTTPException(status_code=404, detail="Manager not found")
    
    # If creating an employee, set current user as manager if no manager specified
    if user_data.role == "employee" and not user_data.manager_id:
        user_data.manager_id = current_user.id
    
    # Generate verification token
    verification_token = email_service.generate_verification_token()
    token_expiry = email_service.get_token_expiry()
    
    @retry_db_operation_with_new_session(max_retries=3, delay=0.1)
    def create_user_with_retry(fresh_db):
        # Create new user
        db_user = models.User(
            email=user_data.email,
            hashed_password=get_password_hash(user_data.password),
            full_name=user_data.full_name,
            role=user_data.role,
            manager_id=user_data.manager_id,
            is_verified=False,
            verification_token=verification_token,
            verification_token_expires=token_expiry
        )
        
        fresh_db.add(db_user)
        fresh_db.commit()
        fresh_db.refresh(db_user)
        return db_user
    
    db_user = create_user_with_retry()
    
    # Send verification email
    try:
        await email_service.send_verification_email(
            to_email=user_data.email,
            full_name=user_data.full_name,
            verification_token=verification_token
        )
        
        # Also send welcome email with credentials
        await email_service.send_welcome_email(
            to_email=user_data.email,
            full_name=user_data.full_name,
            role=user_data.role,
            temp_password=user_data.password
        )
    except Exception as e:
        print(f"Failed to send emails: {e}")
        # Don't fail user creation if email fails
    
    return db_user

@app.get("/users/managers", response_model=list[schemas.User])
def get_all_managers(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can view other managers")
    
    managers = db.query(models.User).filter(models.User.role == "manager").all()
    return managers

@app.get("/users", response_model=list[schemas.User])
def get_all_users(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can view all users")
    
    users = db.query(models.User).all()
    return users

# Feedback routes
@app.post("/feedback", response_model=schemas.Feedback)
def create_feedback(feedback: schemas.FeedbackCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can create feedback")
    
    # Verify employee is in manager's team
    employee = db.query(models.User).filter(models.User.id == feedback.employee_id, models.User.manager_id == current_user.id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found in your team")
    
    @retry_db_operation_with_new_session(max_retries=3, delay=0.1)
    def create_feedback_with_retry(fresh_db):
        db_feedback = models.Feedback(
            manager_id=current_user.id,
            employee_id=feedback.employee_id,
            strengths=feedback.strengths,
            areas_to_improve=feedback.areas_to_improve,
            sentiment=feedback.sentiment
        )
        fresh_db.add(db_feedback)
        fresh_db.commit()
        fresh_db.refresh(db_feedback)
        
        # Add tags if provided
        if feedback.tag_ids:
            tags = fresh_db.query(models.Tag).filter(models.Tag.id.in_(feedback.tag_ids)).all()
            db_feedback.tags = tags
            fresh_db.commit()
        
        return db_feedback
    
    return create_feedback_with_retry()

@app.get("/feedback", response_model=list[schemas.Feedback])
def get_feedback(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "manager":
        # Manager sees all feedback they've given
        feedback = db.query(models.Feedback).filter(models.Feedback.manager_id == current_user.id).all()
    else:
        # Employee sees only their feedback
        feedback = db.query(models.Feedback).filter(models.Feedback.employee_id == current_user.id).all()
    
    return feedback

@app.put("/feedback/{feedback_id}", response_model=schemas.Feedback)
def update_feedback(feedback_id: int, feedback_update: schemas.FeedbackUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can update feedback")
    
    # Verify feedback exists and belongs to current user
    db_feedback = db.query(models.Feedback).filter(models.Feedback.id == feedback_id, models.Feedback.manager_id == current_user.id).first()
    if not db_feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    @retry_db_operation_with_new_session(max_retries=3, delay=0.1)
    def update_feedback_with_retry(fresh_db):
        # Re-fetch the feedback in the new session
        feedback_to_update = fresh_db.query(models.Feedback).filter(
            models.Feedback.id == feedback_id, 
            models.Feedback.manager_id == current_user.id
        ).first()
        
        if not feedback_to_update:
            raise HTTPException(status_code=404, detail="Feedback not found")
        
        update_data = feedback_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            if field != "tag_ids":
                setattr(feedback_to_update, field, value)
        
        if feedback_update.tag_ids is not None:
            tags = fresh_db.query(models.Tag).filter(models.Tag.id.in_(feedback_update.tag_ids)).all()
            feedback_to_update.tags = tags
        
        fresh_db.commit()
        fresh_db.refresh(feedback_to_update)
        return feedback_to_update
    
    return update_feedback_with_retry()

@app.post("/feedback/{feedback_id}/acknowledge")
def acknowledge_feedback(feedback_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "employee":
        raise HTTPException(status_code=403, detail="Only employees can acknowledge feedback")
    
    # Verify feedback exists and belongs to current user
    db_feedback = db.query(models.Feedback).filter(models.Feedback.id == feedback_id, models.Feedback.employee_id == current_user.id).first()
    if not db_feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    @retry_db_operation_with_new_session(max_retries=3, delay=0.1)
    def acknowledge_with_retry(fresh_db):
        # Re-fetch the feedback in the new session
        feedback_to_update = fresh_db.query(models.Feedback).filter(
            models.Feedback.id == feedback_id, 
            models.Feedback.employee_id == current_user.id
        ).first()
        
        if not feedback_to_update:
            raise HTTPException(status_code=404, detail="Feedback not found")
        
        feedback_to_update.acknowledged = True
        feedback_to_update.acknowledged_at = datetime.utcnow()
        fresh_db.commit()
        return {"message": "Feedback acknowledged"}
    
    return acknowledge_with_retry()

# Tags routes
@app.get("/tags", response_model=list[schemas.Tag])
def get_tags(db: Session = Depends(get_db)):
    return db.query(models.Tag).all()

@app.post("/tags", response_model=schemas.Tag)
def create_tag(tag: schemas.TagBase, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can create tags")
    
    db_tag = models.Tag(name=tag.name, color=tag.color)
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag

# Feedback requests routes
@app.post("/feedback-requests", response_model=schemas.FeedbackRequest)
def create_feedback_request(request: schemas.FeedbackRequestCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "employee":
        raise HTTPException(status_code=403, detail="Only employees can request feedback")
    
    @retry_db_operation_with_new_session(max_retries=3, delay=0.1)
    def create_request_with_retry(fresh_db):
        db_request = models.FeedbackRequest(
            employee_id=current_user.id,
            message=request.message
        )
        fresh_db.add(db_request)
        fresh_db.commit()
        fresh_db.refresh(db_request)
        return db_request
    
    return create_request_with_retry()

@app.get("/feedback-requests", response_model=list[schemas.FeedbackRequest])
def get_feedback_requests(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role == "manager":
        # Manager sees requests from their team
        requests = db.query(models.FeedbackRequest).join(models.User).filter(models.User.manager_id == current_user.id).all()
    else:
        # Employee sees their own requests
        requests = db.query(models.FeedbackRequest).filter(models.FeedbackRequest.employee_id == current_user.id).all()
    
    return requests

# Dashboard routes
@app.get("/dashboard/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Only managers can view dashboard stats")
    
    # Get team feedback stats
    team_feedback = db.query(models.Feedback).filter(models.Feedback.manager_id == current_user.id).all()
    
    total_feedback = len(team_feedback)
    positive_feedback = len([f for f in team_feedback if f.sentiment == "positive"])
    neutral_feedback = len([f for f in team_feedback if f.sentiment == "neutral"])
    negative_feedback = len([f for f in team_feedback if f.sentiment == "negative"])
    
    team_members_count = db.query(models.User).filter(models.User.manager_id == current_user.id).count()
    
    # Get recent feedback (last 5)
    recent_feedback = db.query(models.Feedback).filter(models.Feedback.manager_id == current_user.id).order_by(models.Feedback.created_at.desc()).limit(5).all()
    
    return schemas.DashboardStats(
        total_feedback=total_feedback,
        positive_feedback=positive_feedback,
        neutral_feedback=neutral_feedback,
        negative_feedback=negative_feedback,
        team_members_count=team_members_count,
        recent_feedback=recent_feedback
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
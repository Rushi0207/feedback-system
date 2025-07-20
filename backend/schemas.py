from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str
    manager_id: Optional[int] = None

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str

class User(UserBase):
    id: int
    manager_id: Optional[int] = None
    is_verified: bool = False
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class TagBase(BaseModel):
    name: str
    color: str = "#3B82F6"

class Tag(TagBase):
    id: int
    
    class Config:
        from_attributes = True

class FeedbackBase(BaseModel):
    strengths: str
    areas_to_improve: str
    sentiment: str
    tag_ids: Optional[List[int]] = []

class FeedbackCreate(FeedbackBase):
    employee_id: int

class FeedbackUpdate(BaseModel):
    strengths: Optional[str] = None
    areas_to_improve: Optional[str] = None
    sentiment: Optional[str] = None
    tag_ids: Optional[List[int]] = None

class Feedback(FeedbackBase):
    id: int
    manager_id: int
    employee_id: int
    created_at: datetime
    updated_at: datetime
    acknowledged: bool
    acknowledged_at: Optional[datetime] = None
    manager: User
    employee: User
    tags: List[Tag] = []
    
    class Config:
        from_attributes = True

class FeedbackRequestBase(BaseModel):
    message: str

class FeedbackRequestCreate(FeedbackRequestBase):
    pass

class FeedbackRequest(FeedbackRequestBase):
    id: int
    employee_id: int
    status: str
    created_at: datetime
    employee: User
    
    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_feedback: int
    positive_feedback: int
    neutral_feedback: int
    negative_feedback: int
    team_members_count: int
    recent_feedback: List[Feedback]
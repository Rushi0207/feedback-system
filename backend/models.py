from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

# Association table for feedback tags
feedback_tags = Table(
    'feedback_tags',
    Base.metadata,
    Column('feedback_id', Integer, ForeignKey('feedback.id')),
    Column('tag_id', Integer, ForeignKey('tags.id'))
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String)  # "manager" or "employee"
    manager_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True)
    verification_token_expires = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    manager = relationship("User", remote_side=[id], back_populates="team_members")
    team_members = relationship("User", back_populates="manager")
    given_feedback = relationship("Feedback", foreign_keys="Feedback.manager_id", back_populates="manager")
    received_feedback = relationship("Feedback", foreign_keys="Feedback.employee_id", back_populates="employee")
    feedback_requests = relationship("FeedbackRequest", back_populates="employee")

class Feedback(Base):
    __tablename__ = "feedback"
    
    id = Column(Integer, primary_key=True, index=True)
    manager_id = Column(Integer, ForeignKey("users.id"))
    employee_id = Column(Integer, ForeignKey("users.id"))
    strengths = Column(Text)
    areas_to_improve = Column(Text)
    sentiment = Column(String)  # "positive", "neutral", "negative"
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    acknowledged = Column(Boolean, default=False)
    acknowledged_at = Column(DateTime, nullable=True)
    
    # Relationships
    manager = relationship("User", foreign_keys=[manager_id], back_populates="given_feedback")
    employee = relationship("User", foreign_keys=[employee_id], back_populates="received_feedback")
    tags = relationship("Tag", secondary=feedback_tags, back_populates="feedback")

class Tag(Base):
    __tablename__ = "tags"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    color = Column(String, default="#3B82F6")  # Default blue color
    
    # Relationships
    feedback = relationship("Feedback", secondary=feedback_tags, back_populates="tags")

class FeedbackRequest(Base):
    __tablename__ = "feedback_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"))
    message = Column(Text)
    status = Column(String, default="pending")  # "pending", "completed", "declined"
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    employee = relationship("User", back_populates="feedback_requests")
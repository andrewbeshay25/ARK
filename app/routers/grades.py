# app/routers/announcements.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.db.models import Announcements, Courses, Users
from backend.dependencies.auth import get_current_user
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class GradeCreate(BaseModel):
    title: str
    content: str

class GradeResponse(BaseModel):
    announcement_id: int
    title: str
    content: str
    created_at: datetime

    class Config:
        orm_mode = True

@router.post("/courses/{course_id}/announcements", response_model=GradeResponse)
def create_announcement(course_id: int, announcement: GradeCreate, db: Session = Depends(get_db), current_user: Users = Depends(get_current_user)):
    course = db.query(Courses).filter(Courses.course_id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    # Only allow the instructor (or admin) to create an announcement
    if current_user.user_id != course.instructor_id:
        raise HTTPException(status_code=403, detail="Not authorized to create announcements for this course")
    new_announcement = Announcements(
        title=announcement.title,
        content=announcement.content,
        course_id=course_id,
        created_at=datetime.utcnow()
    )
    db.add(new_announcement)
    db.commit()
    db.refresh(new_announcement)
    return new_announcement

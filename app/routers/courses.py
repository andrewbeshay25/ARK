# app/routers/courses.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.db.models import Courses, Users
from backend.dependencies.auth import get_current_user
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import string
import random

router = APIRouter()

def generate_course_code(length=10):
    special_chars = "!@#$%^&*"
    characters = string.ascii_letters + string.digits + special_chars
    return ''.join(random.choice(characters) for _ in range(length))

class CourseCreate(BaseModel):
    course_name: str
    course_description: Optional[str] = None

class CourseResponse(BaseModel):
    course_id: int
    course_name: str
    course_description: Optional[str] = None
    instructor_id: Optional[int] = None

    class Config:
        orm_mode = True

# --- New Pydantic Models for Dashboard Data ---

class AnnouncementResponse(BaseModel):
    announcement_id: int
    title: str
    content: str
    created_at: datetime

    class Config:
        orm_mode = True

class AssignmentResponse(BaseModel):
    assignment_id: int
    assignment_name: str
    assignment_dueDate: datetime  # You can use date if you prefer
    assignment_assignedDate: datetime
    assignment_description: Optional[str] = None

    class Config:
        orm_mode = True

class CourseDashboardResponse(BaseModel):
    course_id: int
    course_name: str
    course_description: Optional[str] = None
    announcements: List[AnnouncementResponse] = []
    assignments: List[AssignmentResponse] = []

    class Config:
        orm_mode = True

# --- End of New Models ---

@router.post("/createCourse")
def create_course(
    course: CourseCreate, 
    db: Session = Depends(get_db), 
    current_user: Users = Depends(get_current_user)
):
    new_course = Courses(
        course_name=course.course_name, 
        course_description=course.course_description, 
        instructor_id=current_user.user_id,
        course_code=generate_course_code(10)
    )
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    # Optionally, add the new course to the current user's enrolled courses.
    current_user.courses.append(new_course)
    db.commit()
    return new_course

# GET endpoint to return courses for the current user
@router.get("/", response_model=List[CourseResponse])
def read_courses(
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    courses = current_user.courses
    return courses

@router.post("/joinCourse")
def join_course(data: dict, db: Session = Depends(get_db), current_user: Users = Depends(get_current_user)):
    course_code = data.get("course_code")
    if not course_code:
        raise HTTPException(status_code=400, detail="Course code is required")
    course = db.query(Courses).filter(Courses.course_code == course_code).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Add the user to the course if they're not already a member.
    if current_user not in course.students:
        course.students.append(current_user)
        db.commit()
    return course

# --- New Endpoint for Course Dashboard ---
@router.get("/{course_id}/dashboard", response_model=CourseDashboardResponse)
def get_course_dashboard(course_id: int, db: Session = Depends(get_db), current_user: Users = Depends(get_current_user)):
    course = db.query(Courses).filter(Courses.course_id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # (Optional) Check if the current user is a member of the course or the instructor.
    if current_user not in course.students and current_user.user_id != course.instructor_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this course dashboard")
    
    return course

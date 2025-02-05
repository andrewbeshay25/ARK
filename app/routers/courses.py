# In app/routers/courses.py (create this file if it doesn’t exist)
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.db.models import Courses, Users
from backend.dependencies.auth import get_current_user  # assuming you have such dependency
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class CourseCreate(BaseModel):
    course_name: str
    course_description: str = None

class CourseResponse(BaseModel):
    course_id: int
    course_name: str
    course_description: Optional[str] = None
    instructor_id: Optional[int] = None

    class Config:
        orm_mode = True

@router.post("/createCourse")
def create_course(
    course: CourseCreate, 
    db: Session = Depends(get_db), 
    current_user: Users = Depends(get_current_user)
):
    # Create the new course, assigning both the name and description.
    # Also set the instructor_id to the current user's id.
    new_course = Courses(
        course_name=course.course_name, 
        course_description=course.course_description, 
        instructor_id=current_user.user_id
    )
    db.add(new_course)
    db.commit()
    db.refresh(new_course)

    # Optionally, add the course to the current user's enrolled courses.
    current_user.courses.append(new_course)
    db.commit()

    return new_course

# New GET endpoint to return courses for the current user
@router.get("/", response_model=List[CourseResponse])
def read_courses(
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    courses = current_user.courses
    return courses

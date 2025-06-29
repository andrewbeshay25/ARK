# app/routers/events.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.db.models import Events, Courses, Users, UserRole
from backend.dependencies.auth import get_current_user
from pydantic import BaseModel
from datetime import date
from typing import List

router = APIRouter()

# Pydantic model for event creation
class EventCreate(BaseModel):
    event_name: str
    event_date: date
    event_description: str = None

# Endpoint to fetch events for all courses the current user is a member of
@router.get("/events", response_model=List[EventCreate])
def get_user_events(db: Session = Depends(get_db), current_user: Users = Depends(get_current_user)):
    # SUPER_ADMIN can see all events, others see only events for enrolled courses
    if current_user.user_role == UserRole.SUPER_ADMIN:
        events = db.query(Events).all()
    else:
        # Get all course ids the user is enrolled in
        course_ids = [course.course_id for course in current_user.courses]
        events = db.query(Events).filter(Events.course_id.in_(course_ids)).all()
    return events

# Endpoint to fetch events for a specific course (for instructor or members)
@router.get("/courses/{course_id}/events", response_model=List[EventCreate])
def get_course_events(course_id: int, db: Session = Depends(get_db), current_user: Users = Depends(get_current_user)):
    course = db.query(Courses).filter(Courses.course_id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    # SUPER_ADMIN can view events for any course, others need to be members or instructors
    if current_user.user_role != UserRole.SUPER_ADMIN and current_user not in course.students and current_user != course.instructor:
        raise HTTPException(status_code=403, detail="Not authorized")
    events = db.query(Events).filter(Events.course_id == course_id).all()
    return events

# Endpoint for an instructor (or admin) to create an event for a given course
@router.post("/courses/{course_id}/events", response_model=EventCreate)
def create_event(course_id: int, event: EventCreate, db: Session = Depends(get_db), current_user: Users = Depends(get_current_user)):
    # Check that the course exists
    course = db.query(Courses).filter(Courses.course_id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    # Only allow if the user is an instructor or admin for that course
    if current_user.user_role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.INSTRUCTOR]:
        raise HTTPException(status_code=403, detail="Not authorized to create events for this course")
    new_event = Events(
        event_name=event.event_name,
        event_date=event.event_date,
        event_description=event.event_description,
        course_id=course_id,
        instructor_id=current_user.user_id
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event

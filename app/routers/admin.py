# app/routers/admin.py
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from backend.db.database import get_db
from backend.db.models import Users, Courses, Events, Announcements, Assignments, Grades, UserRole, AuthProvider
from backend.dependencies.auth import get_current_user
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date
import json

router = APIRouter()

# Helper function to get role display name
def get_role_display_name(role_value):
    role_mapping = {
        "superAdmin": "SUPER_ADMIN",
        "admin": "ADMIN", 
        "instructor": "INSTRUCTOR",
        "student": "STUDENT",
        "parent": "PARENT",
        "test": "TEST"
    }
    return role_mapping.get(role_value, role_value)

# Pydantic models for admin responses
class AdminUserResponse(BaseModel):
    user_id: int
    user_firstName: str
    user_lastName: str
    user_email: str
    user_role: str
    auth_provider: str
    is_active: bool
    is_profile_complete: bool
    enrolled_courses_count: int
    instructed_courses_count: int

    class Config:
        orm_mode = True

class AdminCourseResponse(BaseModel):
    course_id: int
    course_name: str
    course_description: Optional[str]
    course_code: str
    instructor_id: Optional[int]
    instructor_name: Optional[str]
    students_count: int
    events_count: int
    announcements_count: int
    assignments_count: int

    class Config:
        orm_mode = True

class AdminEventResponse(BaseModel):
    event_id: int
    event_name: str
    event_date: date
    event_description: Optional[str]
    course_id: int
    course_name: str
    instructor_id: int
    instructor_name: str

    class Config:
        orm_mode = True

class SystemStatsResponse(BaseModel):
    total_users: int
    total_courses: int
    total_events: int
    total_announcements: int
    total_assignments: int
    users_by_role: dict
    users_by_auth_provider: dict
    active_users: int
    courses_with_events: int

    class Config:
        orm_mode = True

# Pydantic models for update operations
class UserUpdateRequest(BaseModel):
    user_role: Optional[str] = None
    is_active: Optional[bool] = None

class CourseUpdateRequest(BaseModel):
    course_name: Optional[str] = None
    course_description: Optional[str] = None
    course_code: Optional[str] = None
    instructor_id: Optional[int] = None

class EventUpdateRequest(BaseModel):
    event_name: Optional[str] = None
    event_description: Optional[str] = None
    event_date: Optional[date] = None
    instructor_id: Optional[int] = None

# Helper function to check if user is SUPER_ADMIN
def require_super_admin(current_user: Users = Depends(get_current_user)):
    if current_user.user_role != UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Super admin access required")
    return current_user

# Get all users with filters
@router.get("/users", response_model=List[AdminUserResponse])
def get_all_users(
    role: Optional[str] = Query(None, description="Filter by user role"),
    auth_provider: Optional[str] = Query(None, description="Filter by auth provider"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    search: Optional[str] = Query(None, description="Search in name or email"),
    db: Session = Depends(get_db),
    current_user: Users = Depends(require_super_admin)
):
    query = db.query(Users)
    
    # Apply filters
    if role:
        # Map display names back to enum values for filtering
        role_mapping = {
            "SUPER_ADMIN": "superAdmin",
            "ADMIN": "admin",
            "INSTRUCTOR": "instructor", 
            "STUDENT": "student",
            "PARENT": "parent",
            "TEST": "test"
        }
        enum_value = role_mapping.get(role, role)
        query = query.filter(Users.user_role == UserRole(enum_value))
    if auth_provider:
        query = query.filter(Users.auth_provider == AuthProvider(auth_provider))
    if is_active is not None:
        query = query.filter(Users.is_active == is_active)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Users.user_firstName.ilike(search_term)) |
            (Users.user_lastName.ilike(search_term)) |
            (Users.user_email.ilike(search_term))
        )
    
    users = query.all()
    
    # Enhance with additional data
    result = []
    for user in users:
        enrolled_count = len(user.courses)
        instructed_count = len(user.instructed_courses)
        
        result.append(AdminUserResponse(
            user_id=user.user_id,
            user_firstName=user.user_firstName,
            user_lastName=user.user_lastName,
            user_email=user.user_email,
            user_role=get_role_display_name(user.user_role.value),
            auth_provider=user.auth_provider.value,
            is_active=user.is_active,
            is_profile_complete=user.is_profile_complete,
            enrolled_courses_count=enrolled_count,
            instructed_courses_count=instructed_count
        ))
    
    return result

# Update user role and status
@router.put("/users/{user_id}")
def update_user(
    user_id: int,
    user_data: UserUpdateRequest,
    db: Session = Depends(get_db),
    current_user: Users = Depends(require_super_admin)
):
    print(f"Updating user {user_id} with data: {user_data}")  # Debug log
    print(f"Current user ID: {current_user.user_id}")  # Debug log
    
    user = db.query(Users).filter(Users.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent self-modification
    if user.user_id == current_user.user_id:
        print(f"Self-modification attempt: user {user_id} trying to modify themselves")  # Debug log
        raise HTTPException(status_code=400, detail="Cannot modify your own account")
    
    if user_data.user_role is not None:
        try:
            print(f"Attempting to set role to: {user_data.user_role}")  # Debug log
            # The frontend sends the enum value directly (e.g., "superAdmin", "admin")
            user.user_role = UserRole(user_data.user_role)
            print(f"Role set successfully to: {user.user_role.value}")  # Debug log
        except ValueError as e:
            print(f"Invalid role value: {user_data.user_role}, error: {e}")  # Debug log
            raise HTTPException(status_code=400, detail=f"Invalid user role: {user_data.user_role}")
    
    if user_data.is_active is not None:
        user.is_active = user_data.is_active
        print(f"Active status set to: {user.is_active}")  # Debug log
    
    db.commit()
    return {"message": "User updated successfully"}

# Delete user
@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: Users = Depends(require_super_admin)
):
    user = db.query(Users).filter(Users.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent self-deletion
    if user.user_id == current_user.user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    # Delete related data first
    db.query(Grades).filter(Grades.student_id == user_id).delete()
    db.query(Assignments).filter(Assignments.instructor_id == user_id).delete()
    db.query(Announcements).filter(Announcements.instructor_id == user_id).delete()
    db.query(Events).filter(Events.instructor_id == user_id).delete()
    
    # Remove from courses
    for course in user.courses:
        course.students.remove(user)
    
    # Remove from instructed courses
    for course in user.instructed_courses:
        course.instructor = None
    
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

# Get all courses with details
@router.get("/courses", response_model=List[AdminCourseResponse])
def get_all_courses(
    search: Optional[str] = Query(None, description="Search in course name or description"),
    instructor_id: Optional[int] = Query(None, description="Filter by instructor ID"),
    db: Session = Depends(get_db),
    current_user: Users = Depends(require_super_admin)
):
    query = db.query(Courses)
    
    # Apply filters
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Courses.course_name.ilike(search_term)) |
            (Courses.course_description.ilike(search_term))
        )
    if instructor_id:
        query = query.filter(Courses.instructor_id == instructor_id)
    
    courses = query.all()
    
    # Enhance with additional data
    result = []
    for course in courses:
        students_count = len(course.students)
        events_count = len(course.events)
        announcements_count = len(course.announcements)
        assignments_count = len(course.assignments)
        
        instructor_name = None
        if course.instructor:
            instructor_name = f"{course.instructor.user_firstName} {course.instructor.user_lastName}"
        
        result.append(AdminCourseResponse(
            course_id=course.course_id,
            course_name=course.course_name,
            course_description=course.course_description,
            course_code=course.course_code,
            instructor_id=course.instructor_id,
            instructor_name=instructor_name,
            students_count=students_count,
            events_count=events_count,
            announcements_count=announcements_count,
            assignments_count=assignments_count
        ))
    
    return result

# Update course
@router.put("/courses/{course_id}")
def update_course(
    course_id: int,
    course_data: CourseUpdateRequest,
    db: Session = Depends(get_db),
    current_user: Users = Depends(require_super_admin)
):
    course = db.query(Courses).filter(Courses.course_id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if course_data.course_name is not None:
        course.course_name = course_data.course_name
    
    if course_data.course_description is not None:
        course.course_description = course_data.course_description
    
    if course_data.course_code is not None:
        # Check if course code already exists
        existing_course = db.query(Courses).filter(
            Courses.course_code == course_data.course_code,
            Courses.course_id != course_id
        ).first()
        if existing_course:
            raise HTTPException(status_code=400, detail="Course code already exists")
        course.course_code = course_data.course_code
    
    if course_data.instructor_id is not None:
        # Verify instructor exists and has appropriate role
        instructor = db.query(Users).filter(Users.user_id == course_data.instructor_id).first()
        if not instructor:
            raise HTTPException(status_code=404, detail="Instructor not found")
        if instructor.user_role not in [UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]:
            raise HTTPException(status_code=400, detail="User must be an instructor")
        course.instructor_id = course_data.instructor_id
    
    db.commit()
    return {"message": "Course updated successfully"}

# Delete course
@router.delete("/courses/{course_id}")
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: Users = Depends(require_super_admin)
):
    course = db.query(Courses).filter(Courses.course_id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Delete related data
    db.query(Grades).filter(Grades.course_id == course_id).delete()
    db.query(Assignments).filter(Assignments.course_id == course_id).delete()
    db.query(Announcements).filter(Announcements.course_id == course_id).delete()
    db.query(Events).filter(Events.course_id == course_id).delete()
    
    db.delete(course)
    db.commit()
    return {"message": "Course deleted successfully"}

# Get all events with course and instructor details
@router.get("/events", response_model=List[AdminEventResponse])
def get_all_events(
    course_id: Optional[int] = Query(None, description="Filter by course ID"),
    instructor_id: Optional[int] = Query(None, description="Filter by instructor ID"),
    date_from: Optional[date] = Query(None, description="Filter events from date"),
    date_to: Optional[date] = Query(None, description="Filter events to date"),
    search: Optional[str] = Query(None, description="Search in event name or description"),
    db: Session = Depends(get_db),
    current_user: Users = Depends(require_super_admin)
):
    query = db.query(Events).join(Courses).join(Users, Events.instructor_id == Users.user_id)
    
    # Apply filters
    if course_id:
        query = query.filter(Events.course_id == course_id)
    if instructor_id:
        query = query.filter(Events.instructor_id == instructor_id)
    if date_from:
        query = query.filter(Events.event_date >= date_from)
    if date_to:
        query = query.filter(Events.event_date <= date_to)
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Events.event_name.ilike(search_term)) |
            (Events.event_description.ilike(search_term))
        )
    
    events = query.all()
    
    # Enhance with additional data
    result = []
    for event in events:
        result.append(AdminEventResponse(
            event_id=event.event_id,
            event_name=event.event_name,
            event_date=event.event_date,
            event_description=event.event_description,
            course_id=event.course_id,
            course_name=event.course.course_name,
            instructor_id=event.instructor_id,
            instructor_name=f"{event.instructor.user_firstName} {event.instructor.user_lastName}"
        ))
    
    return result

# Update event
@router.put("/events/{event_id}")
def update_event(
    event_id: int,
    event_data: EventUpdateRequest,
    db: Session = Depends(get_db),
    current_user: Users = Depends(require_super_admin)
):
    event = db.query(Events).filter(Events.event_id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if event_data.event_name is not None:
        event.event_name = event_data.event_name
    
    if event_data.event_description is not None:
        event.event_description = event_data.event_description
    
    if event_data.event_date is not None:
        event.event_date = event_data.event_date
    
    if event_data.instructor_id is not None:
        # Verify instructor exists and has appropriate role
        instructor = db.query(Users).filter(Users.user_id == event_data.instructor_id).first()
        if not instructor:
            raise HTTPException(status_code=404, detail="Instructor not found")
        if instructor.user_role not in [UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]:
            raise HTTPException(status_code=400, detail="User must be an instructor")
        event.instructor_id = event_data.instructor_id
    
    db.commit()
    return {"message": "Event updated successfully"}

# Delete event
@router.delete("/events/{event_id}")
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: Users = Depends(require_super_admin)
):
    event = db.query(Events).filter(Events.event_id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    db.delete(event)
    db.commit()
    return {"message": "Event deleted successfully"}

# Get system statistics
@router.get("/stats", response_model=SystemStatsResponse)
def get_system_stats(
    db: Session = Depends(get_db),
    current_user: Users = Depends(require_super_admin)
):
    # Basic counts
    total_users = db.query(Users).count()
    total_courses = db.query(Courses).count()
    total_events = db.query(Events).count()
    total_announcements = db.query(Announcements).count()
    total_assignments = db.query(Assignments).count()
    active_users = db.query(Users).filter(Users.is_active == True).count()
    
    # Users by role
    users_by_role = {}
    for role in UserRole:
        count = db.query(Users).filter(Users.user_role == role).count()
        users_by_role[role.value] = count
    
    # Users by auth provider
    users_by_auth_provider = {}
    for provider in AuthProvider:
        count = db.query(Users).filter(Users.auth_provider == provider).count()
        users_by_auth_provider[provider.value] = count
    
    # Courses with events
    courses_with_events = db.query(Courses).join(Events).distinct().count()
    
    return SystemStatsResponse(
        total_users=total_users,
        total_courses=total_courses,
        total_events=total_events,
        total_announcements=total_announcements,
        total_assignments=total_assignments,
        users_by_role=users_by_role,
        users_by_auth_provider=users_by_auth_provider,
        active_users=active_users,
        courses_with_events=courses_with_events
    )

# Export data endpoint
@router.post("/export")
def export_data(
    data_type: str = Query(..., description="Type of data to export: users, courses, events, stats"),
    filters: Optional[str] = Query(None, description="JSON string of filters to apply"),
    db: Session = Depends(get_db),
    current_user: Users = Depends(require_super_admin)
):
    try:
        filter_dict = json.loads(filters) if filters else {}
        
        if data_type == "users":
            data = get_all_users(**filter_dict, db=db, current_user=current_user)
        elif data_type == "courses":
            data = get_all_courses(**filter_dict, db=db, current_user=current_user)
        elif data_type == "events":
            data = get_all_events(**filter_dict, db=db, current_user=current_user)
        elif data_type == "stats":
            data = get_system_stats(db=db, current_user=current_user)
        else:
            raise HTTPException(status_code=400, detail="Invalid data type")
        
        return {
            "data": data,
            "exported_at": datetime.utcnow().isoformat(),
            "filters_applied": filter_dict,
            "total_records": len(data) if isinstance(data, list) else 1
        }
    
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid filters JSON")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}") 
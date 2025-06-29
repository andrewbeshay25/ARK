# app/routers/courses.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.db.models import Courses, Users, UserRole, Announcements, Assignments, Grades, Events
from backend.dependencies.auth import get_current_user
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date
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
        from_attributes = True

# --- New Pydantic Models for Dashboard Data ---

class InstructorInfo(BaseModel):
    user_id: int
    firstName: str
    lastName: str
    email: str

    class Config:
        from_attributes = True

class AnnouncementResponse(BaseModel):
    announcement_id: int
    title: str
    content: str
    created_at: datetime
    instructor_id: Optional[int] = None
    instructor_name: Optional[str] = None

    class Config:
        from_attributes = True

class AssignmentResponse(BaseModel):
    assignment_id: int
    assignment_name: str
    assignment_dueDate: datetime  # You can use date if you prefer
    assignment_assignedDate: datetime
    assignment_description: Optional[str] = None
    instructor_id: Optional[int] = None
    instructor_name: Optional[str] = None

    class Config:
        from_attributes = True

class GradeResponse(BaseModel):
    grade_id: int
    grade: int
    assignment_id: int
    student_id: int
    assignment_name: Optional[str] = None
    student_name: Optional[str] = None
    submitted_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class EventResponse(BaseModel):
    event_id: int
    event_name: str
    event_date: date
    event_description: Optional[str] = None
    course_id: int
    instructor_id: int
    instructor_name: Optional[str] = None

    class Config:
        from_attributes = True

class CourseDashboardResponse(BaseModel):
    course_id: int
    course_name: str
    course_description: Optional[str] = None
    course_code: str
    instructor: Optional[InstructorInfo] = None
    students_count: int
    assignments_count: int
    announcements_count: int
    events_count: int
    recent_assignments: List[AssignmentResponse] = []
    recent_announcements: List[AnnouncementResponse] = []
    upcoming_events: List[EventResponse] = []

    class Config:
        from_attributes = True

# --- New Models for Detailed Course Information ---

class StudentInfo(BaseModel):
    user_id: int
    firstName: str
    lastName: str
    email: str
    user_role: str
    is_active: bool

    class Config:
        from_attributes = True

class RecentActivityItem(BaseModel):
    type: str  # "announcement", "assignment", "grade"
    title: str
    description: str
    timestamp: datetime
    course_id: int

    class Config:
        from_attributes = True

class DetailedCourseResponse(BaseModel):
    course_id: int
    course_name: str
    course_description: Optional[str] = None
    course_code: str
    instructor: Optional[InstructorInfo] = None
    student_count: int
    recent_activity: List[dict] = []
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

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
    # SUPER_ADMIN can see all courses, others see only enrolled courses
    if current_user.user_role == UserRole.SUPER_ADMIN:
        courses = db.query(Courses).all()
    else:
        courses = current_user.courses
    return courses

# GET endpoint to return all courses for admins
@router.get("/all", response_model=List[CourseResponse])
def read_all_courses(
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    # Only allow admins and super admins to see all courses
    if current_user.user_role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=403, detail="Not authorized to view all courses")
    courses = db.query(Courses).all()
    return courses

# NEW: GET endpoint for detailed course information
@router.get("/detailed", response_model=List[DetailedCourseResponse])
def get_detailed_courses(
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    print(f"Current user: {current_user.user_firstName} {current_user.user_lastName}")
    print(f"Current user role: {current_user.user_role}")
    print(f"Current user role value: {current_user.user_role.value}")
    print(f"Current user ID: {current_user.user_id}")
    print(f"UserRole.SUPER_ADMIN: {UserRole.SUPER_ADMIN}")
    print(f"UserRole.SUPER_ADMIN.value: {UserRole.SUPER_ADMIN.value}")
    print(f"Are they equal? {current_user.user_role == UserRole.SUPER_ADMIN}")
    
    # SUPER_ADMIN can see all courses, others see only enrolled courses
    if current_user.user_role == UserRole.SUPER_ADMIN:
        courses = db.query(Courses).all()
        print(f"SUPER_ADMIN: Found {len(courses)} total courses")
    else:
        courses = current_user.courses
        print(f"Regular user: Found {len(courses)} enrolled courses")
        for course in courses:
            print(f"  Enrolled in: {course.course_name} (ID: {course.course_id})")

    detailed_courses = []
    
    for course in courses:
        print(f"Processing course: {course.course_name} (ID: {course.course_id})")
        print(f"  Instructor ID: {course.instructor_id}")
        
        # Get instructor information
        instructor = None
        if course.instructor_id:
            instructor_user = db.query(Users).filter(Users.user_id == course.instructor_id).first()
            print(f"  Found instructor user: {instructor_user}")
            if instructor_user:
                print(f"  Instructor name: {instructor_user.user_firstName} {instructor_user.user_lastName}")
                instructor = InstructorInfo(
                    user_id=instructor_user.user_id,
                    firstName=instructor_user.user_firstName,
                    lastName=instructor_user.user_lastName,
                    email=instructor_user.user_email
                )
                print(f"  Created instructor info: {instructor}")

        # Get student count
        student_count = len(course.students) if course.students else 0
        print(f"  Student count: {student_count}")

        # Get recent activity (last 5 items)
        recent_activity = []
        
        # Get recent announcements
        recent_announcements = db.query(Announcements).filter(
            Announcements.course_id == course.course_id
        ).order_by(Announcements.created_at.desc()).limit(3).all()
        
        for announcement in recent_announcements:
            recent_activity.append(RecentActivityItem(
                type="announcement",
                title=announcement.title,
                description=announcement.content[:100] + "..." if len(announcement.content) > 100 else announcement.content,
                timestamp=announcement.created_at,
                course_id=course.course_id
            ))

        # Get recent assignments
        recent_assignments = []
        assignments = db.query(Assignments).filter(
            Assignments.course_id == course.course_id
        ).order_by(Assignments.assignment_assignedDate.desc()).limit(2).all()
        
        for assignment in recent_assignments:
            recent_activity.append(RecentActivityItem(
                type="assignment",
                title=assignment.assignment_name,
                description=f"Due: {assignment.assignment_dueDate.strftime('%B %d, %Y')}",
                timestamp=assignment.assignment_assignedDate,
                course_id=course.course_id
            ))

        # Sort by timestamp and take top 5
        recent_activity.sort(key=lambda x: x.timestamp, reverse=True)
        recent_activity = recent_activity[:5]

        detailed_course = DetailedCourseResponse(
            course_id=course.course_id,
            course_name=course.course_name,
            course_description=course.course_description,
            course_code=course.course_code,
            instructor=instructor,
            student_count=student_count,
            recent_activity=recent_activity,
            created_at=None  # Since we removed created_at from the Courses model
        )
        
        detailed_courses.append(detailed_course)

    return detailed_courses

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
    print(f"Dashboard request - Course ID: {course_id}")
    print(f"Current user: {current_user.user_firstName} {current_user.user_lastName} (ID: {current_user.user_id})")
    print(f"User role: {current_user.user_role}")
    
    course = db.query(Courses).filter(Courses.course_id == course_id).first()
    if not course:
        print(f"Course {course_id} not found")
        raise HTTPException(status_code=404, detail="Course not found")
    
    print(f"Found course: {course.course_name}")
    print(f"Course instructor ID: {course.instructor_id}")
    print(f"User is instructor: {current_user.user_id == course.instructor_id}")
    print(f"User is SUPER_ADMIN: {current_user.user_role == UserRole.SUPER_ADMIN}")
    print(f"User is enrolled: {current_user in course.students}")
    
    # SUPER_ADMIN can view any course dashboard, others need to be members or instructors
    if current_user.user_role != UserRole.SUPER_ADMIN and current_user not in course.students and current_user.user_id != course.instructor_id:
        print("User not authorized to view this course dashboard")
        raise HTTPException(status_code=403, detail="Not authorized to view this course dashboard")
    
    print("User authorized, proceeding with dashboard data...")
    
    # Get instructor information
    instructor = None
    if course.instructor_id:
        instructor_user = db.query(Users).filter(Users.user_id == course.instructor_id).first()
        if instructor_user:
            instructor = InstructorInfo(
                user_id=instructor_user.user_id,
                firstName=instructor_user.user_firstName,
                lastName=instructor_user.user_lastName,
                email=instructor_user.user_email
            )

    # Get counts
    students_count = len(course.students) if course.students else 0
    assignments_count = len(course.assignments) if course.assignments else 0
    announcements_count = len(course.announcements) if course.announcements else 0
    events_count = len(course.events) if course.events else 0

    # Get recent assignments (last 5)
    recent_assignments = []
    assignments = db.query(Assignments).filter(
        Assignments.course_id == course_id
    ).order_by(Assignments.assignment_dueDate.asc()).limit(5).all()
    
    for assignment in assignments:
        # Get instructor info from the course
        instructor_user = db.query(Users).filter(Users.user_id == course.instructor_id).first()
        instructor_name = f"{instructor_user.user_firstName} {instructor_user.user_lastName}" if instructor_user else "Unknown"
        recent_assignments.append(AssignmentResponse(
            assignment_id=assignment.assignment_id,
            assignment_name=assignment.assignment_name,
            assignment_description=assignment.assignment_description,
            assignment_dueDate=assignment.assignment_dueDate,
            assignment_assignedDate=assignment.assignment_assignedDate,
            instructor_id=course.instructor_id,
            instructor_name=instructor_name
        ))

    # Get recent announcements (last 5)
    recent_announcements = []
    announcements = db.query(Announcements).filter(
        Announcements.course_id == course_id
    ).order_by(Announcements.created_at.desc()).limit(5).all()
    
    for announcement in announcements:
        # Get instructor info from the course
        instructor_user = db.query(Users).filter(Users.user_id == course.instructor_id).first()
        instructor_name = f"{instructor_user.user_firstName} {instructor_user.user_lastName}" if instructor_user else "Unknown"
        recent_announcements.append(AnnouncementResponse(
            announcement_id=announcement.announcement_id,
            title=announcement.title,
            content=announcement.content,
            created_at=announcement.created_at,
            instructor_id=course.instructor_id,
            instructor_name=instructor_name
        ))

    # Get upcoming events (next 5)
    upcoming_events = []
    events = db.query(Events).filter(
        Events.course_id == course_id,
        Events.event_date >= date.today()
    ).order_by(Events.event_date.asc()).limit(5).all()
    
    for event in events:
        instructor_user = db.query(Users).filter(Users.user_id == event.instructor_id).first()
        instructor_name = f"{instructor_user.user_firstName} {instructor_user.user_lastName}" if instructor_user else "Unknown"
        upcoming_events.append(EventResponse(
            event_id=event.event_id,
            event_name=event.event_name,
            event_description=event.event_description,
            event_date=event.event_date,
            course_id=event.course_id,
            instructor_id=event.instructor_id,
            instructor_name=instructor_name
        ))

    return CourseDashboardResponse(
        course_id=course.course_id,
        course_name=course.course_name,
        course_description=course.course_description,
        course_code=course.course_code,
        instructor=instructor,
        students_count=students_count,
        assignments_count=assignments_count,
        announcements_count=announcements_count,
        events_count=events_count,
        recent_assignments=recent_assignments,
        recent_announcements=recent_announcements,
        upcoming_events=upcoming_events
    )

@router.get("/{course_id}/assignments", response_model=List[AssignmentResponse])
def get_course_assignments(course_id: int, db: Session = Depends(get_db), current_user: Users = Depends(get_current_user)):
    course = db.query(Courses).filter(Courses.course_id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if current_user.user_role != UserRole.SUPER_ADMIN and current_user not in course.students and current_user.user_id != course.instructor_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this course")
    
    assignments = db.query(Assignments).filter(Assignments.course_id == course_id).order_by(Assignments.assignment_dueDate.asc()).all()
    
    result = []
    for assignment in assignments:
        # Get instructor info from the course
        instructor_user = db.query(Users).filter(Users.user_id == course.instructor_id).first()
        instructor_name = f"{instructor_user.user_firstName} {instructor_user.user_lastName}" if instructor_user else "Unknown"
        result.append(AssignmentResponse(
            assignment_id=assignment.assignment_id,
            assignment_name=assignment.assignment_name,
            assignment_description=assignment.assignment_description,
            assignment_dueDate=assignment.assignment_dueDate,
            assignment_assignedDate=assignment.assignment_assignedDate,
            instructor_id=course.instructor_id,
            instructor_name=instructor_name
        ))
    
    return result

@router.get("/{course_id}/announcements", response_model=List[AnnouncementResponse])
def get_course_announcements(course_id: int, db: Session = Depends(get_db), current_user: Users = Depends(get_current_user)):
    course = db.query(Courses).filter(Courses.course_id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if current_user.user_role != UserRole.SUPER_ADMIN and current_user not in course.students and current_user.user_id != course.instructor_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this course")
    
    announcements = db.query(Announcements).filter(Announcements.course_id == course_id).order_by(Announcements.created_at.desc()).all()
    
    result = []
    for announcement in announcements:
        # Get instructor info from the course
        instructor_user = db.query(Users).filter(Users.user_id == course.instructor_id).first()
        instructor_name = f"{instructor_user.user_firstName} {instructor_user.user_lastName}" if instructor_user else "Unknown"
        result.append(AnnouncementResponse(
            announcement_id=announcement.announcement_id,
            title=announcement.title,
            content=announcement.content,
            created_at=announcement.created_at,
            instructor_id=course.instructor_id,
            instructor_name=instructor_name
        ))
    
    return result

@router.get("/{course_id}/grades", response_model=List[GradeResponse])
def get_course_grades(course_id: int, db: Session = Depends(get_db), current_user: Users = Depends(get_current_user)):
    course = db.query(Courses).filter(Courses.course_id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Only instructors and admins can view grades
    if current_user.user_role not in [UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN] and current_user.user_id != course.instructor_id:
        raise HTTPException(status_code=403, detail="Not authorized to view grades")
    
    # Get all assignments for this course
    assignments = db.query(Assignments).filter(Assignments.course_id == course_id).all()
    assignment_ids = [assignment.assignment_id for assignment in assignments]
    
    # Get all grades for these assignments
    grades = db.query(Grades).filter(Grades.assignment_id.in_(assignment_ids)).all()
    
    result = []
    for grade in grades:
        assignment = db.query(Assignments).filter(Assignments.assignment_id == grade.assignment_id).first()
        student = db.query(Users).filter(Users.user_id == grade.student_id).first()
        
        if assignment and student:
            result.append(GradeResponse(
                grade_id=grade.grade_id,
                grade=grade.grade,
                assignment_id=grade.assignment_id,
                assignment_name=assignment.assignment_name,
                student_id=grade.student_id,
                student_name=f"{student.user_firstName} {student.user_lastName}",
                submitted_at=grade.submitted_at if hasattr(grade, 'submitted_at') else None
            ))
    
    return result

@router.get("/{course_id}/members", response_model=List[StudentInfo])
def get_course_members(course_id: int, db: Session = Depends(get_db), current_user: Users = Depends(get_current_user)):
    course = db.query(Courses).filter(Courses.course_id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if current_user.user_role != UserRole.SUPER_ADMIN and current_user not in course.students and current_user.user_id != course.instructor_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this course")
    
    result = []
    for student in course.students:
        result.append(StudentInfo(
            user_id=student.user_id,
            firstName=student.user_firstName,
            lastName=student.user_lastName,
            email=student.user_email,
            user_role=student.user_role.value,
            is_active=student.is_active
        ))
    
    return result

@router.get("/{course_id}/events", response_model=List[EventResponse])
def get_course_events(course_id: int, db: Session = Depends(get_db), current_user: Users = Depends(get_current_user)):
    course = db.query(Courses).filter(Courses.course_id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if current_user.user_role != UserRole.SUPER_ADMIN and current_user not in course.students and current_user.user_id != course.instructor_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this course")
    
    events = db.query(Events).filter(Events.course_id == course_id).order_by(Events.event_date.asc()).all()
    
    result = []
    for event in events:
        instructor_user = db.query(Users).filter(Users.user_id == event.instructor_id).first()
        instructor_name = f"{instructor_user.user_firstName} {instructor_user.user_lastName}" if instructor_user else "Unknown"
        result.append(EventResponse(
            event_id=event.event_id,
            event_name=event.event_name,
            event_description=event.event_description,
            event_date=event.event_date,
            course_id=event.course_id,
            instructor_id=event.instructor_id,
            instructor_name=instructor_name
        ))
    
    return result

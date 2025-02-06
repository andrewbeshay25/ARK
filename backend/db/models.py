# backend/db/models.py
from sqlalchemy import Column, Integer, String, ForeignKey, Date, Table, Enum, Text, Boolean, DateTime
from sqlalchemy.orm import relationship
from backend.db.database import Base
import enum
from datetime import datetime

# Enum for user roles
class UserRole(enum.Enum):
    SUPER_ADMIN = "superAdmin"
    ADMIN = "admin"
    INSTRUCTOR = "instructor"
    PARENT = "parent"
    STUDENT = "student"
    TEST = "test"

class AuthProvider(enum.Enum):
    LOCAL = "local"
    GOOGLE = "google"

# Association table for students and courses
student_courses = Table(
    "student_courses",
    Base.metadata,
    Column("student_id", Integer, ForeignKey("users.user_id"), primary_key=True),
    Column("course_id", Integer, ForeignKey("courses.course_id"), primary_key=True)
)

class Users(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, index=True)
    user_firstName = Column(String, nullable=False)
    user_lastName = Column(String, nullable=False)
    user_role = Column(Enum(UserRole), default=UserRole.ADMIN, nullable=False) # Change from ADMIN to something else
    user_email = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    is_profile_complete = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    auth_provider = Column(Enum(AuthProvider), default=AuthProvider.LOCAL, nullable=False)

    courses = relationship("Courses", secondary=student_courses, back_populates="students")
    grades = relationship("Grades", back_populates="student")
    instructed_courses = relationship("Courses", back_populates="instructor", foreign_keys='Courses.instructor_id')
    # New relationship for events created by this user (if instructor)
    created_events = relationship("Events", back_populates="instructor", foreign_keys="Events.instructor_id")

class Courses(Base):
    __tablename__ = "courses"
    course_id = Column(Integer, primary_key=True, index=True)
    course_name = Column(String, nullable=False)
    course_description = Column(Text, nullable=True)
    instructor_id = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    course_code = Column(String, unique=True, index=True, nullable=False)

    students = relationship("Users", secondary=student_courses, back_populates="courses")
    assignments = relationship("Assignments", back_populates="course")
    announcements = relationship("Announcements", back_populates="course")
    events = relationship("Events", back_populates="course")  # New relationship for events
    instructor = relationship("Users", back_populates="instructed_courses", foreign_keys=[instructor_id])

class Announcements(Base):
    __tablename__ = "announcements"
    announcement_id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    course_id = Column(Integer, ForeignKey("courses.course_id"), nullable=False)

    course = relationship("Courses", back_populates="announcements")

class Assignments(Base):
    __tablename__ = "assignments"
    assignment_id = Column(Integer, primary_key=True, index=True)
    assignment_name = Column(String, nullable=False)
    assignment_dueDate = Column(Date, nullable=False)
    assignment_assignedDate = Column(Date, nullable=False)
    assignment_description = Column(Text, nullable=True)
    course_id = Column(Integer, ForeignKey("courses.course_id"), nullable=False)

    course = relationship("Courses", back_populates="assignments")
    grades = relationship("Grades", back_populates="assignment")

class Grades(Base):
    __tablename__ = "grades"
    grade_id = Column(Integer, primary_key=True, index=True)
    grade = Column(Integer, nullable=False)
    assignment_id = Column(Integer, ForeignKey("assignments.assignment_id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)

    assignment = relationship("Assignments", back_populates="grades")
    student = relationship("Users", back_populates="grades")

# NEW: Events model
class Events(Base):
    __tablename__ = "events"
    event_id = Column(Integer, primary_key=True, index=True)
    event_name = Column(String, nullable=False)
    event_date = Column(Date, nullable=False)
    event_description = Column(Text, nullable=True)
    course_id = Column(Integer, ForeignKey("courses.course_id"), nullable=False)
    instructor_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)  # Who created the event

    course = relationship("Courses", back_populates="events")
    instructor = relationship("Users", back_populates="created_events", foreign_keys=[instructor_id])

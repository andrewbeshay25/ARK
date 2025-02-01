from sqlalchemy import Column, Integer, String, ForeignKey, Date, Table, Enum, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ARRAY
from backend.db.database import Base
import enum

# Enum for user roles
class UserRole(enum.Enum):
    SUPER_ADMIN = "superAdmin"
    ADMIN = "admin"
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
    user_role = Column(Enum(UserRole), default=UserRole.TEST, nullable=False)
    user_email = Column(String, unique=True, index=True)  # Add email as a unique identifier
    hashed_password = Column(String, nullable=False)
    is_profile_complete = Column(Boolean, default=False)  # New field to track profile completion
    is_active = Column(Boolean, default=True)
    auth_provider = Column(Enum(AuthProvider), default=AuthProvider.LOCAL, nullable=False)

    # Relationships
    courses = relationship("Courses", secondary=student_courses, back_populates="students")
    grades = relationship("Grades", back_populates="student")

class Courses(Base):
    __tablename__ = "courses"

    course_id = Column(Integer, primary_key=True, index=True)
    course_name = Column(String, nullable=False)

    # Relationships
    students = relationship("Users", secondary=student_courses, back_populates="courses")
    assignments = relationship("Assignments", back_populates="course")

class Assignments(Base):
    __tablename__ = "assignments"

    assignment_id = Column(Integer, primary_key=True, index=True)
    assignment_name = Column(String, nullable=False)
    assignment_dueDate = Column(Date, nullable=False)
    assignment_assignedDate = Column(Date, nullable=False)
    assignment_description = Column(Text, nullable=True)

    # Foreign Keys
    course_id = Column(Integer, ForeignKey("courses.course_id"), nullable=False)

    # Relationships
    course = relationship("Courses", back_populates="assignments")
    grades = relationship("Grades", back_populates="assignment")

class Grades(Base):
    __tablename__ = "grades"

    grade_id = Column(Integer, primary_key=True, index=True)
    grade = Column(Integer, nullable=False)

    # Foreign Keys
    assignment_id = Column(Integer, ForeignKey("assignments.assignment_id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)

    # Relationships
    assignment = relationship("Assignments", back_populates="grades")
    student = relationship("Users", back_populates="grades")

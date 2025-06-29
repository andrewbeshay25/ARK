# app/routers/grades.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.db.models import Grades, Assignments, Users, Courses
from backend.dependencies.auth import get_current_user
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

class GradeCreate(BaseModel):
    grade: int
    assignment_id: int
    student_id: int

class GradeResponse(BaseModel):
    grade_id: int
    grade: int
    assignment_id: int
    student_id: int
    assignment_name: Optional[str] = None
    student_name: Optional[str] = None

    class Config:
        from_attributes = True

@router.post("/assignments/{assignment_id}/grades", response_model=GradeResponse)
def create_grade(
    assignment_id: int, 
    grade_data: GradeCreate, 
    db: Session = Depends(get_db), 
    current_user: Users = Depends(get_current_user)
):
    # Check if assignment exists
    assignment = db.query(Assignments).filter(Assignments.assignment_id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    # Check if student exists
    student = db.query(Users).filter(Users.user_id == grade_data.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Check if grade already exists for this student and assignment
    existing_grade = db.query(Grades).filter(
        Grades.assignment_id == assignment_id,
        Grades.student_id == grade_data.student_id
    ).first()
    
    if existing_grade:
        raise HTTPException(status_code=400, detail="Grade already exists for this student and assignment")
    
    # Only allow instructors or admins to create grades
    course = db.query(Courses).filter(Courses.course_id == assignment.course_id).first()
    if current_user.user_role.value not in ["admin", "superAdmin"] and current_user.user_id != course.instructor_id:
        raise HTTPException(status_code=403, detail="Not authorized to create grades")
    
    new_grade = Grades(
        grade=grade_data.grade,
        assignment_id=assignment_id,
        student_id=grade_data.student_id
    )
    db.add(new_grade)
    db.commit()
    db.refresh(new_grade)
    
    # Add assignment and student names for response
    new_grade.assignment_name = assignment.assignment_name
    new_grade.student_name = f"{student.user_firstName} {student.user_lastName}"
    
    return new_grade

@router.get("/assignments/{assignment_id}/grades", response_model=List[GradeResponse])
def get_assignment_grades(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    # Check if assignment exists
    assignment = db.query(Assignments).filter(Assignments.assignment_id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    # Check authorization
    course = db.query(Courses).filter(Courses.course_id == assignment.course_id).first()
    if current_user.user_role.value not in ["admin", "superAdmin"] and current_user.user_id != course.instructor_id:
        raise HTTPException(status_code=403, detail="Not authorized to view grades")
    
    grades = db.query(Grades).filter(Grades.assignment_id == assignment_id).all()
    
    # Add assignment and student names
    for grade in grades:
        grade.assignment_name = assignment.assignment_name
        student = db.query(Users).filter(Users.user_id == grade.student_id).first()
        if student:
            grade.student_name = f"{student.user_firstName} {student.user_lastName}"
    
    return grades

@router.put("/grades/{grade_id}", response_model=GradeResponse)
def update_grade(
    grade_id: int,
    grade_data: GradeCreate,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    grade = db.query(Grades).filter(Grades.grade_id == grade_id).first()
    if not grade:
        raise HTTPException(status_code=404, detail="Grade not found")
    
    # Check authorization
    assignment = db.query(Assignments).filter(Assignments.assignment_id == grade.assignment_id).first()
    course = db.query(Courses).filter(Courses.course_id == assignment.course_id).first()
    if current_user.user_role.value not in ["admin", "superAdmin"] and current_user.user_id != course.instructor_id:
        raise HTTPException(status_code=403, detail="Not authorized to update grades")
    
    grade.grade = grade_data.grade
    db.commit()
    db.refresh(grade)
    
    # Add assignment and student names
    grade.assignment_name = assignment.assignment_name
    student = db.query(Users).filter(Users.user_id == grade.student_id).first()
    if student:
        grade.student_name = f"{student.user_firstName} {student.user_lastName}"
    
    return grade

@router.delete("/grades/{grade_id}")
def delete_grade(
    grade_id: int,
    db: Session = Depends(get_db),
    current_user: Users = Depends(get_current_user)
):
    grade = db.query(Grades).filter(Grades.grade_id == grade_id).first()
    if not grade:
        raise HTTPException(status_code=404, detail="Grade not found")
    
    # Check authorization
    assignment = db.query(Assignments).filter(Assignments.assignment_id == grade.assignment_id).first()
    course = db.query(Courses).filter(Courses.course_id == assignment.course_id).first()
    if current_user.user_role.value not in ["admin", "superAdmin"] and current_user.user_id != course.instructor_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete grades")
    
    db.delete(grade)
    db.commit()
    return {"message": "Grade deleted successfully"}

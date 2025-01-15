from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.db.models import Users
from backend.utils.auth_utils import create_access_token
from backend.utils.passwordHashing import verify_password, hash_password

router = APIRouter()

@router.post("/register")
def register_user(username: str, password: str, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(Users).filter(Users.user_username == username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    # Hash the password and save the user
    hashed_pw = hash_password(password)
    new_user = Users(user_username=username, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User registered successfully"}

@router.post("/login")
def login_user(username: str, password: str, db: Session = Depends(get_db)):
    # Verify user exists
    user = db.query(Users).filter(Users.user_username == username).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # Create JWT token
    access_token = create_access_token({"sub": user.user_username})
    return {"access_token": access_token, "token_type": "bearer"}

from pydantic import BaseModel
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException
from backend.db.models import Users
from backend.db.database import get_db
from backend.utils.passwordHashing import hash_password
from backend.utils.auth_utils import create_access_token
from backend.utils.passwordHashing import verify_password

router = APIRouter()

# Pydantic model for registration request
class RegisterRequest(BaseModel):
    username: str
    password: str
    firstName: str
    lastName: str

@router.post("/register")
def register_user(request: RegisterRequest, db: Session = Depends(get_db)):
    # Check if the username already exists
    existing_user = db.query(Users).filter(Users.user_username == request.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    # Hash the password and create the user
    hashed_pw = hash_password(request.password)
    new_user = Users(
        user_username=request.username,
        hashed_password=hashed_pw,
        user_firstName=request.firstName,
        user_lastName=request.lastName,
        is_profile_complete=False  # Profile setup is incomplete
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully", "username": request.username}

@router.post("/login")
def login_user(username: str, password: str, db: Session = Depends(get_db)):
    """
    Authenticate the user and return a JWT token if credentials are valid.
    """
    # Query the database for the user
    user = db.query(Users).filter(Users.user_username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Verify the password
    if not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect password")

    # Generate a JWT token
    access_token = create_access_token(data={"sub": user.user_username})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "message": f"Welcome back, {user.user_firstName}!"
    }

from pydantic import BaseModel
from sqlalchemy.orm import Session
from fastapi import APIRouter, HTTPException, Depends, Request
from authlib.integrations.starlette_client import OAuth
from starlette.responses import RedirectResponse
from backend.db.models import Users, AuthProvider
from backend.db.database import get_db
from backend.utils.passwordHashing import hash_password, verify_password
from backend.utils.auth_utils import create_access_token
import os

router = APIRouter()

# Pydantic model for registration request
class RegisterRequest(BaseModel):
    email: str
    password: str
    firstName: str
    lastName: str

# Pydantic model for login request validation
class LoginRequest(BaseModel):
    email: str
    password: str

# Initialize OAuth
oauth = OAuth()
oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

@router.post("/register")
def register_user(request: RegisterRequest, db: Session = Depends(get_db)):
    # Check if the email already exists
    existing_user = db.query(Users).filter(Users.user_email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash the password and save the user
    hashed_pw = hash_password(request.password)
    new_user = Users(
        user_firstName=request.firstName,
        user_lastName=request.lastName,
        user_email=request.email,
        hashed_password=hashed_pw,
        is_profile_complete=False,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate JWT token for the new user
    access_token = create_access_token({"sub": new_user.user_email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "firstName": new_user.user_firstName,
        "user_role": new_user.user_role.name
    }

@router.post("/login")
def login_user(request: LoginRequest, db: Session = Depends(get_db)):
    # Query user by email
    user = db.query(Users).filter(Users.user_email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.auth_provider == AuthProvider.GOOGLE:
        raise HTTPException(
            status_code=401,
            detail="This account uses Google authentication. Please sign in using Google."
        )
    
    # Verify password
    if not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect password")

    # Generate JWT token
    access_token = create_access_token({"sub": user.user_email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "firstName": user.user_firstName,
        "user_role": user.user_role.name
    }

@router.get("/google/login")
async def google_login(request: Request):
    redirect_uri = "http://localhost:8000/auth/google/callback"
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get("userinfo")
    if not user_info:
        raise HTTPException(status_code=400, detail="Google authentication failed")

    # Check if user exists in your database or register them
    db_user = db.query(Users).filter(Users.user_email == user_info["email"]).first()
    if not db_user:
        # Register the user if not found
        dummy_password = hash_password("google_dummy_password")
        db_user = Users(
            user_email=user_info["email"],
            user_firstName=user_info.get("given_name"),
            user_lastName=user_info.get("family_name"),
            hashed_password=dummy_password,
            is_profile_complete=True,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

    # Generate a JWT token for the user
    access_token = create_access_token({"sub": db_user.user_email})
    # Build the redirect URL with token, first name, and user role
    redirect_url = (
        f"http://localhost:3000/home?"
        f"token={access_token}&firstName={db_user.user_firstName}"
        f"&user_role={db_user.user_role.name}"
    )
    return RedirectResponse(url=redirect_url)

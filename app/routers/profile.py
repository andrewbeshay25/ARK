from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from backend.dependencies.auth import get_current_user
from backend.db.models import Users
from backend.db.database import get_db
from typing import Optional
from datetime import date

router = APIRouter()

# Pydantic models for profile requests
class ProfileSetupRequest(BaseModel):
    email: EmailStr
    dateOfBirth: Optional[str] = None
    streetAddress: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zipcode: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None

class ProfileUpdateRequest(BaseModel):
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    email: Optional[EmailStr] = None
    dateOfBirth: Optional[str] = None
    streetAddress: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zipcode: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None
    profilePic: Optional[str] = None

class ProfileResponse(BaseModel):
    user_id: int
    firstName: str
    lastName: str
    email: str
    role: str
    is_profile_complete: bool
    profile_pic: Optional[str] = None
    dateOfBirth: Optional[str] = None
    streetAddress: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zipcode: Optional[str] = None
    phone: Optional[str] = None
    bio: Optional[str] = None

class ProfilePictureUpdateRequest(BaseModel):
    profile_pic_url: str

@router.get("/me", response_model=ProfileResponse)
def get_profile(current_user: Users = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get current user's profile"""
    return ProfileResponse(
        user_id=current_user.user_id,
        firstName=current_user.user_firstName,
        lastName=current_user.user_lastName,
        email=current_user.user_email,
        role=current_user.user_role.value,
        is_profile_complete=current_user.is_profile_complete,
        profile_pic=current_user.user_profile_pic,
        dateOfBirth=current_user.user_dateofbirth.isoformat() if current_user.user_dateofbirth else None,
        streetAddress=current_user.user_streetaddress,
        city=current_user.user_city,
        state=current_user.user_state,
        zipcode=current_user.user_zipcode,
        phone=current_user.user_phone,
        bio=current_user.user_bio
    )

@router.put("/setup-profile")
def setup_profile(request: ProfileSetupRequest, current_user: Users = Depends(get_current_user), db: Session = Depends(get_db)):
    """Initial profile setup"""
    user = db.query(Users).filter(Users.user_id == current_user.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update user profile fields
    user.user_email = request.email
    if request.dateOfBirth:
        user.user_dateofbirth = date.fromisoformat(request.dateOfBirth)
    user.user_streetaddress = request.streetAddress
    user.user_city = request.city
    user.user_state = request.state
    user.user_zipcode = request.zipcode
    user.user_phone = request.phone
    user.user_bio = request.bio
    user.is_profile_complete = True

    db.commit()
    db.refresh(user)

    return {"message": "Profile setup completed successfully"}

@router.put("/update")
def update_profile(request: ProfileUpdateRequest, current_user: Users = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update user profile"""
    user = db.query(Users).filter(Users.user_id == current_user.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update only provided fields
    if request.firstName is not None:
        user.user_firstName = request.firstName
    if request.lastName is not None:
        user.user_lastName = request.lastName
    if request.email is not None:
        user.user_email = request.email
    if request.dateOfBirth is not None:
        user.user_dateofbirth = date.fromisoformat(request.dateOfBirth)
    if request.streetAddress is not None:
        user.user_streetaddress = request.streetAddress
    if request.city is not None:
        user.user_city = request.city
    if request.state is not None:
        user.user_state = request.state
    if request.zipcode is not None:
        user.user_zipcode = request.zipcode
    if request.phone is not None:
        user.user_phone = request.phone
    if request.bio is not None:
        user.user_bio = request.bio
    if request.profilePic is not None:
        user.user_profile_pic = request.profilePic

    db.commit()
    db.refresh(user)

    return {"message": "Profile updated successfully"}

@router.put("/profile-pic")
def update_profile_picture(request: ProfilePictureUpdateRequest, current_user: Users = Depends(get_current_user), db: Session = Depends(get_db)):
    """Update profile picture URL"""
    user = db.query(Users).filter(Users.user_id == current_user.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.user_profile_pic = request.profile_pic_url
    db.commit()
    db.refresh(user)

    return {"message": "Profile picture updated successfully", "profile_pic": request.profile_pic_url}

@router.delete("/profile-pic")
def remove_profile_picture(current_user: Users = Depends(get_current_user), db: Session = Depends(get_db)):
    """Remove profile picture"""
    user = db.query(Users).filter(Users.user_id == current_user.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.user_profile_pic = None
    db.commit()
    db.refresh(user)

    return {"message": "Profile picture removed successfully"}

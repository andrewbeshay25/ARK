from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.dependencies.auth import get_current_user
from backend.db.models import Users
from backend.db.database import get_db

router = APIRouter()

# Pydantic model for profile setup request
class ProfileSetupRequest(BaseModel):
    email: str
    dateOfBirth: str
    streetAddress: str
    city: str
    state: str
    zipcode: str

@router.put("/setup-profile")
def setup_profile(request: ProfileSetupRequest, current_user: Users = Depends(get_current_user), db: Session = Depends(get_db)):
    # Update user profile
    user = db.query(Users).filter(Users.user_id == current_user.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.user_email = request.email
    user.user_dateOfBirth = request.dateOfBirth
    user.user_streetAddress = request.streetAddress
    user.user_city = request.city
    user.user_state = request.state
    user.user_zipcode = request.zipcode
    user.is_profile_complete = True  # Mark profile as complete

    db.commit()
    db.refresh(user)

    return {"message": "Profile setup completed successfully"}

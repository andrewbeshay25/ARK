from fastapi import APIRouter, Depends, HTTPException
from backend.dependencies.auth import get_current_user
from backend.db.models import Users

router = APIRouter()

@router.get("/route")
def protected_route(current_user: Users = Depends(get_current_user)):
    return {"message": f"Welcome {current_user.user_firstName}"}


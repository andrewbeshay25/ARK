from fastapi import Depends, HTTPException
from backend.utils.auth_utils import decode_access_token
from backend.db.database import get_db
from backend.db.models import Users
from sqlalchemy.orm import Session

def get_current_user(token: str, db: Session = Depends(get_db)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    username = payload.get("sub")
    if not username:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(Users).filter(Users.user_username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user

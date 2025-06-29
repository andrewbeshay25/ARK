from fastapi import FastAPI
from app.routers import auth, protected, profile, courses, events, announcements, grades, admin
from backend.db.database import engine
import backend.db.models as models
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware  # Import SessionMiddleware
import os
from fastapi.openapi.models import OAuthFlows as OAuthFlowsModel
from fastapi.openapi.models import OAuth2 as OAuth2Model
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

app = FastAPI(
    title="ARK API",
    description="API for managing courses, users, and authentication",
    version="1.0.0",
    openapi_url="/openapi.json",
)
app = FastAPI()

# Add SessionMiddleware
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SECRET_KEY"),  # Use a secure key!
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins / URLs
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Initialize database
models.Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(protected.router, prefix="/protected", tags=["Protected"])
app.include_router(profile.router, prefix="/profile", tags=["Profile"])
app.include_router(courses.router, prefix="/courses", tags=["Courses"])
app.include_router(events.router, tags=["Events"])  # No prefix since events router has full paths
app.include_router(announcements.router, prefix="/announcements", tags=["Announcements"])
app.include_router(grades.router, prefix="/grades", tags=["Grades"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])



@app.get("/")
def index():
    return {"message": "Hello World!"}
@app.get("/test-token")
def get_test_token():
    return {"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0VXNlckBnbWFpbC5jb20iLCJleHAiOjE3Mzg4MDE4NTJ9.Ce7k6g3_laWpzW1wo5Q9sMF8mNpXjE_e55xjuzEhUTs", "token_type": "bearer"}
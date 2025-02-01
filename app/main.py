from fastapi import FastAPI
from app.routers import auth, protected, profile
from backend.db.database import engine
import backend.db.models as models
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware  # Import SessionMiddleware
import os

app = FastAPI()

# Add SessionMiddleware
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SECRET_KEY", "some_random_secret_key"),  # Use a secure key!
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this to match your frontend URL
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

@app.get("/")
def index():
    return {"message": "Hello World!"}

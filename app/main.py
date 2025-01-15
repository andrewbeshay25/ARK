from fastapi import FastAPI
from app.routers import auth, protected
from backend.db.database import engine
import backend.db.models as models

app = FastAPI()

# Initialize database
models.Base.metadata.create_all(bind=engine)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(protected.router, prefix="/protected", tags=["Protected"])

@app.get("/")
def index():
    return {"message": "Hello World!"}

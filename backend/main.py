
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models, schemas, crud
from .database import Base, engine, SessionLocal
from .sample_data import seed_database
from .routers import auth_routes, user_routes, admin_routes

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Train Ticket Scheduler and Route Optimizer",
    description="FastAPI backend with role-based access, ticket booking, and "
                "Dijkstra-based route optimization.",
    version="1.0.0",
)


_origins_env = os.getenv("FRONTEND_ORIGINS", "*").strip()
if _origins_env == "*":
    _allow_origins = ["*"]
else:
    _allow_origins = [o.strip() for o in _origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allow_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(admin_routes.router)


@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        seed_database(db, models)
        # default admin
        if not crud.get_user_by_username(db, "admin"):
            crud.create_user(db, schemas.UserCreate(
                username="admin", email="admin@trainscheduler.com",
                password="admin123", role="admin",
            ), auto_verify=True)   # default admin is pre-verified
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "Train Ticket Scheduler and Route Optimizer API is running",
            "docs": "/docs"}
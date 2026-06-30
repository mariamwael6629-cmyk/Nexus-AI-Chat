from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.exceptions import register_exception_handlers
from app.routers import auth, chats, dashboard, memories, messages, settings as settings_router, users

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Nexus AI API",
    description="Backend API for the Nexus AI memory-first chat platform.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(chats.router)
app.include_router(messages.router)
app.include_router(memories.router)
app.include_router(settings_router.router)
app.include_router(dashboard.router)


@app.get("/api/health", tags=["health"])
def health_check():
    return {"status": "ok"}

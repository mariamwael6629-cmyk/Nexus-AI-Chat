from datetime import datetime, timezone

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    first_name: Mapped[str] = mapped_column(String(80), default="")
    last_name: Mapped[str] = mapped_column(String(80), default="")
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(120), default="")
    plan: Mapped[str] = mapped_column(String(40), default="Free")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    chats = relationship("Chat", back_populates="owner", cascade="all, delete-orphan")
    memories = relationship("Memory", back_populates="owner", cascade="all, delete-orphan")
    settings = relationship("UserSettings", back_populates="owner", uselist=False, cascade="all, delete-orphan")

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip() or self.email.split("@")[0]

    @property
    def initials(self) -> str:
        parts = [p for p in (self.first_name, self.last_name) if p]
        if not parts:
            return self.email[:2].upper()
        return "".join(p[0] for p in parts).upper()

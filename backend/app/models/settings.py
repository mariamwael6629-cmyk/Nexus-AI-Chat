from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class UserSettings(Base):
    __tablename__ = "user_settings"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False, index=True)

    ai_name: Mapped[str] = mapped_column(String(80), default="Nexus")
    ai_personality: Mapped[str] = mapped_column(String(40), default="technical")
    response_language: Mapped[str] = mapped_column(String(40), default="English (UK)")

    persistent_memory: Mapped[bool] = mapped_column(Boolean, default=True)
    auto_save_preferences: Mapped[bool] = mapped_column(Boolean, default=True)
    share_usage_analytics: Mapped[bool] = mapped_column(Boolean, default=False)
    conversation_training: Mapped[bool] = mapped_column(Boolean, default=False)

    notify_new_memory: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_weekly_digest: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_new_releases: Mapped[bool] = mapped_column(Boolean, default=False)

    owner = relationship("User", back_populates="settings")

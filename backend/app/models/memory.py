from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Memory(Base):
    __tablename__ = "memories"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(40), default="preference")
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    value: Mapped[str] = mapped_column(Text, nullable=False)
    source: Mapped[str] = mapped_column(String(120), default="Manual entry")
    tags: Mapped[str] = mapped_column(String(300), default="")  # comma-separated
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="memories")

    @property
    def tag_list(self) -> list[str]:
        return [t for t in self.tags.split(",") if t]

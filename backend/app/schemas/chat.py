from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ChatCreateRequest(BaseModel):
    name: str = Field(default="New Chat", max_length=200)


class ChatUpdateRequest(BaseModel):
    name: str | None = Field(default=None, max_length=200)
    pinned: bool | None = None
    archived: bool | None = None


class ChatResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    pinned: bool
    archived: bool
    created_at: datetime
    updated_at: datetime
    message_count: int = 0
    last_message_preview: str = ""

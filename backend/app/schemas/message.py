from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class MessageCreateRequest(BaseModel):
    content: str = Field(min_length=1, max_length=8000)


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    chat_id: int
    role: str
    content: str
    created_at: datetime


class SendMessageResponse(BaseModel):
    user_message: MessageResponse
    ai_message: MessageResponse
    memories_referenced: list[str] = []

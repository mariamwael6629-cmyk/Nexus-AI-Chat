from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models.chat import Chat
from app.models.message import Message
from app.models.user import User
from app.schemas.message import MessageCreateRequest, MessageResponse, SendMessageResponse
from app.services.ai_service import generate_reply

router = APIRouter(prefix="/api/chats/{chat_id}/messages", tags=["messages"])


def _get_owned_chat(db: Session, chat_id: int, user: User) -> Chat:
    chat = db.get(Chat, chat_id)
    if not chat or chat.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
    return chat


@router.get("", response_model=list[MessageResponse])
def list_messages(chat_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    chat = _get_owned_chat(db, chat_id, current_user)
    return chat.messages


@router.post("", response_model=SendMessageResponse, status_code=status.HTTP_201_CREATED)
def send_message(
    chat_id: int,
    payload: MessageCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    chat = _get_owned_chat(db, chat_id, current_user)

    user_message = Message(chat_id=chat.id, role="user", content=payload.content)
    db.add(user_message)
    db.flush()

    reply_text, referenced = generate_reply(db, current_user.id, payload.content)
    ai_message = Message(chat_id=chat.id, role="assistant", content=reply_text)
    db.add(ai_message)

    db.commit()
    db.refresh(user_message)
    db.refresh(ai_message)

    return SendMessageResponse(
        user_message=user_message,
        ai_message=ai_message,
        memories_referenced=referenced,
    )

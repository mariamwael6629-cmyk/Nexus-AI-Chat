from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models.chat import Chat
from app.models.user import User
from app.schemas.chat import ChatCreateRequest, ChatResponse, ChatUpdateRequest

router = APIRouter(prefix="/api/chats", tags=["chats"])


def _to_response(chat: Chat) -> ChatResponse:
    last = chat.messages[-1] if chat.messages else None
    return ChatResponse(
        id=chat.id,
        name=chat.name,
        pinned=chat.pinned,
        archived=chat.archived,
        created_at=chat.created_at,
        updated_at=chat.updated_at,
        message_count=len(chat.messages),
        last_message_preview=(last.content[:80] if last else ""),
    )


def _get_owned_chat(db: Session, chat_id: int, user: User) -> Chat:
    chat = db.get(Chat, chat_id)
    if not chat or chat.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
    return chat


@router.get("", response_model=list[ChatResponse])
def list_chats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    chats = (
        db.query(Chat)
        .filter(Chat.user_id == current_user.id)
        .order_by(Chat.pinned.desc(), Chat.updated_at.desc())
        .all()
    )
    return [_to_response(c) for c in chats]


@router.post("", response_model=ChatResponse, status_code=status.HTTP_201_CREATED)
def create_chat(
    payload: ChatCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    chat = Chat(user_id=current_user.id, name=payload.name)
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return _to_response(chat)


@router.put("/{chat_id}", response_model=ChatResponse)
def update_chat(
    chat_id: int,
    payload: ChatUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    chat = _get_owned_chat(db, chat_id, current_user)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(chat, field, value)
    db.commit()
    db.refresh(chat)
    return _to_response(chat)


@router.delete("/{chat_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chat(
    chat_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    chat = _get_owned_chat(db, chat_id, current_user)
    db.delete(chat)
    db.commit()

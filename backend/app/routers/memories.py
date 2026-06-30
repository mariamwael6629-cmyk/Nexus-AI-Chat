from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models.memory import Memory
from app.models.user import User
from app.schemas.memory import MemoryCreateRequest, MemoryResponse, MemoryUpdateRequest

router = APIRouter(prefix="/api/memories", tags=["memories"])


def _to_response(memory: Memory) -> MemoryResponse:
    return MemoryResponse(
        id=memory.id,
        category=memory.category,
        title=memory.title,
        value=memory.value,
        source=memory.source,
        tags=memory.tag_list,
        created_at=memory.created_at,
    )


def _get_owned_memory(db: Session, memory_id: int, user: User) -> Memory:
    memory = db.get(Memory, memory_id)
    if not memory or memory.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Memory not found")
    return memory


@router.get("", response_model=list[MemoryResponse])
def list_memories(
    category: str | None = Query(default=None),
    search: str | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Memory).filter(Memory.user_id == current_user.id)
    if category and category != "all":
        query = query.filter(Memory.category == category)
    if search:
        like = f"%{search}%"
        query = query.filter(or_(Memory.title.ilike(like), Memory.value.ilike(like)))
    memories = query.order_by(Memory.created_at.desc()).all()
    return [_to_response(m) for m in memories]


@router.post("", response_model=MemoryResponse, status_code=status.HTTP_201_CREATED)
def create_memory(
    payload: MemoryCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    memory = Memory(
        user_id=current_user.id,
        category=payload.category,
        title=payload.title,
        value=payload.value,
        source=payload.source,
        tags=",".join(payload.tags),
    )
    db.add(memory)
    db.commit()
    db.refresh(memory)
    return _to_response(memory)


@router.put("/{memory_id}", response_model=MemoryResponse)
def update_memory(
    memory_id: int,
    payload: MemoryUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    memory = _get_owned_memory(db, memory_id, current_user)
    data = payload.model_dump(exclude_unset=True)
    if "tags" in data:
        memory.tags = ",".join(data.pop("tags") or [])
    for field, value in data.items():
        setattr(memory, field, value)
    db.commit()
    db.refresh(memory)
    return _to_response(memory)


@router.delete("/{memory_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_memory(
    memory_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    memory = _get_owned_memory(db, memory_id, current_user)
    db.delete(memory)
    db.commit()


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def clear_memories(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(Memory).filter(Memory.user_id == current_user.id).delete()
    db.commit()

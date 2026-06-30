from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models.chat import Chat
from app.models.memory import Memory
from app.models.message import Message
from app.models.user import User
from app.schemas.dashboard import ActivityItem, ChartPoint, DashboardResponse, DashboardStats

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

_DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


@router.get("", response_model=DashboardResponse)
def get_dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    total_conversations = db.query(Chat).filter(Chat.user_id == current_user.id).count()
    saved_memories = db.query(Memory).filter(Memory.user_id == current_user.id).count()
    messages_sent = (
        db.query(Message)
        .join(Chat, Message.chat_id == Chat.id)
        .filter(Chat.user_id == current_user.id, Message.role == "user")
        .count()
    )

    now = datetime.now(timezone.utc)
    chart: list[ChartPoint] = []
    for i in range(6, -1, -1):
        day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        count = (
            db.query(Message)
            .join(Chat, Message.chat_id == Chat.id)
            .filter(
                Chat.user_id == current_user.id,
                Message.created_at >= day_start,
                Message.created_at < day_end,
            )
            .count()
        )
        chart.append(ChartPoint(label=_DAY_LABELS[day_start.weekday()], value=count))

    recent_messages = (
        db.query(Message)
        .join(Chat, Message.chat_id == Chat.id)
        .filter(Chat.user_id == current_user.id)
        .order_by(Message.created_at.desc())
        .limit(5)
        .all()
    )
    recent_activity = [
        ActivityItem(
            text=f"{'You' if m.role == 'user' else 'Nexus AI'}: {m.content[:60]}",
            color="amethyst" if m.role == "user" else "teal",
            time=m.created_at.strftime("%b %d, %H:%M"),
        )
        for m in recent_messages
    ]

    return DashboardResponse(
        stats=DashboardStats(
            total_conversations=total_conversations,
            saved_memories=saved_memories,
            messages_sent=messages_sent,
        ),
        chart=chart,
        recent_activity=recent_activity,
    )

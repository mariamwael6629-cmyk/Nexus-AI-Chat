"""Seeds a freshly registered user with starter content so the app isn't
empty on first login, mirroring the demo data the static mockup used to
hardcode in JavaScript."""
from sqlalchemy.orm import Session

from app.models.chat import Chat
from app.models.memory import Memory
from app.models.message import Message
from app.models.settings import UserSettings

_STARTER_MEMORIES = [
    ("preference", "Communication Style", "Prefers technical, precise explanations.", "style,communication"),
    ("work", "Tech Stack", "Open to learning your tech stack as we chat.", "tech,stack"),
]


def seed_new_user(db: Session, user_id: int) -> None:
    db.add(UserSettings(user_id=user_id))

    chat = Chat(user_id=user_id, name="Welcome to Nexus AI", pinned=True)
    db.add(chat)
    db.flush()

    db.add(Message(chat_id=chat.id, role="assistant", content=(
        "Hi! I'm Nexus — I remember context across our conversations and use it to "
        "personalize my answers. Ask me anything to get started."
    )))

    for category, title, value, tags in _STARTER_MEMORIES:
        db.add(Memory(user_id=user_id, category=category, title=title, value=value, source="Onboarding", tags=tags))

    db.commit()

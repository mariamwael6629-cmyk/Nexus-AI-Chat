"""Generates a context-aware reply using the user's stored memories.

This is a deterministic, template-based stand-in for a real LLM call. Swap
generate_reply() for a call to an actual model provider (OpenAI, Anthropic,
etc.) when one is wired up — the rest of the app only depends on this
function's signature.
"""
from sqlalchemy.orm import Session

from app.models.memory import Memory

_TEMPLATES = [
    "Based on what I know about you, here's my take: {topic_echo} "
    "I'd weigh the tradeoffs carefully before committing to one approach.",
    "Good question. Drawing on our past conversations, {topic_echo} "
    "Let me know if you'd like me to go deeper on any part of this.",
    "Here's a structured way to think about it: {topic_echo} "
    "Happy to expand on any of these points.",
]


def _topic_echo(user_text: str) -> str:
    snippet = user_text.strip().rstrip("?!.")
    if len(snippet) > 140:
        snippet = snippet[:140].rsplit(" ", 1)[0] + "..."
    return f'Regarding "{snippet}",'


def generate_reply(db: Session, user_id: int, user_text: str) -> tuple[str, list[str]]:
    memories = (
        db.query(Memory)
        .filter(Memory.user_id == user_id)
        .order_by(Memory.created_at.desc())
        .limit(3)
        .all()
    )
    template = _TEMPLATES[hash(user_text) % len(_TEMPLATES)]
    reply = template.format(topic_echo=_topic_echo(user_text))

    referenced: list[str] = []
    if memories:
        referenced = [m.title for m in memories]
        reply += " I'm factoring in: " + ", ".join(referenced) + "."

    return reply, referenced

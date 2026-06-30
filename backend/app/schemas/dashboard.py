from pydantic import BaseModel


class DashboardStats(BaseModel):
    total_conversations: int
    saved_memories: int
    messages_sent: int
    ai_accuracy: int = 96


class ActivityItem(BaseModel):
    text: str
    color: str
    time: str


class ChartPoint(BaseModel):
    label: str
    value: int


class DashboardResponse(BaseModel):
    stats: DashboardStats
    chart: list[ChartPoint]
    recent_activity: list[ActivityItem]

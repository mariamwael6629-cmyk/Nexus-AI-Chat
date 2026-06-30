from pydantic import BaseModel, ConfigDict


class SettingsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    ai_name: str
    ai_personality: str
    response_language: str
    persistent_memory: bool
    auto_save_preferences: bool
    share_usage_analytics: bool
    conversation_training: bool
    notify_new_memory: bool
    notify_weekly_digest: bool
    notify_new_releases: bool


class SettingsUpdateRequest(BaseModel):
    ai_name: str | None = None
    ai_personality: str | None = None
    response_language: str | None = None
    persistent_memory: bool | None = None
    auto_save_preferences: bool | None = None
    share_usage_analytics: bool | None = None
    conversation_training: bool | None = None
    notify_new_memory: bool | None = None
    notify_weekly_digest: bool | None = None
    notify_new_releases: bool | None = None

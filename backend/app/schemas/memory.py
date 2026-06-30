from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class MemoryCreateRequest(BaseModel):
    category: str = Field(default="preference", max_length=40)
    title: str = Field(min_length=1, max_length=200)
    value: str = Field(min_length=1)
    source: str = Field(default="Manual entry", max_length=120)
    tags: list[str] = Field(default_factory=list)

    @field_validator("category")
    @classmethod
    def category_must_be_known(cls, v: str) -> str:
        allowed = {"preference", "work", "project", "profile", "interest"}
        if v not in allowed:
            raise ValueError(f"category must be one of {sorted(allowed)}")
        return v


class MemoryUpdateRequest(BaseModel):
    category: str | None = Field(default=None, max_length=40)
    title: str | None = Field(default=None, max_length=200)
    value: str | None = None
    tags: list[str] | None = None


class MemoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    category: str
    title: str
    value: str
    source: str
    tags: list[str]
    created_at: datetime

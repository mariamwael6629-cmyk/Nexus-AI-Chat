from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.database import get_db
from app.models.settings import UserSettings
from app.models.user import User
from app.schemas.settings import SettingsResponse, SettingsUpdateRequest

router = APIRouter(prefix="/api/settings", tags=["settings"])


def _get_or_create(db: Session, user_id: int) -> UserSettings:
    settings_row = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
    if not settings_row:
        settings_row = UserSettings(user_id=user_id)
        db.add(settings_row)
        db.commit()
        db.refresh(settings_row)
    return settings_row


@router.get("", response_model=SettingsResponse)
def get_settings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return _get_or_create(db, current_user.id)


@router.put("", response_model=SettingsResponse)
def update_settings(
    payload: SettingsUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    settings_row = _get_or_create(db, current_user.id)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(settings_row, field, value)
    db.commit()
    db.refresh(settings_row)
    return settings_row

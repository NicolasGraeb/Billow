from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from schemas.user_schemas import UserResponse


class EventBase(BaseModel):
    name: str
    description: Optional[str] = None


class EventCreate(EventBase):
    participant_ids: List[int] = []


class EventResponse(EventBase):
    id: int
    created_by: int
    status: str
    created_at: datetime
    finished_at: Optional[datetime] = None
    participants: List[UserResponse] = []
    creator: UserResponse

    class Config:
        from_attributes = True


class EventUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


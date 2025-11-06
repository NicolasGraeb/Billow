from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from schemas.user_schemas import UserResponse


class FriendshipBase(BaseModel):
    friend_id: int


class FriendshipResponse(BaseModel):
    id: int
    user_id: int
    friend_id: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    user: UserResponse
    friend: UserResponse

    class Config:
        from_attributes = True


class FriendshipRequestResponse(BaseModel):
    id: int
    from_user: Optional[UserResponse] = None
    to_user: Optional[UserResponse] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


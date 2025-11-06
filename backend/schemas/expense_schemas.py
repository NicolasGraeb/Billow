from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from schemas.user_schemas import UserResponse


class ExpenseParticipantCreate(BaseModel):
    user_id: int
    amount: float


class ExpenseParticipantResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    user: UserResponse

    class Config:
        from_attributes = True


class ExpenseBase(BaseModel):
    amount: float
    description: Optional[str] = None
    participants: List[ExpenseParticipantCreate] = []


class ExpenseCreate(ExpenseBase):
    event_id: int
    payer_id: int


class ExpenseUpdate(BaseModel):
    amount: Optional[float] = None
    description: Optional[str] = None
    payer_id: Optional[int] = None
    participants: Optional[List[ExpenseParticipantCreate]] = None


class ExpenseResponse(ExpenseBase):
    id: int
    event_id: int
    payer_id: int
    created_at: datetime
    payer: UserResponse
    participants: List[ExpenseParticipantResponse] = []

    class Config:
        from_attributes = True


class BalanceEntry(BaseModel):
    from_user_id: int
    to_user_id: int
    amount: float
    from_user: UserResponse
    to_user: UserResponse


class EventBalance(BaseModel):
    event_id: int
    balances: List[BalanceEntry] = []
    summary: dict


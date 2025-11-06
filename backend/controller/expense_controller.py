from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from auth.dependencies import get_db, get_current_user
from service.expense_service import ExpenseService
from schemas.expense_schemas import ExpenseCreate, ExpenseResponse, ExpenseUpdate, EventBalance
from models.models import User

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.post("/", response_model=ExpenseResponse, status_code=201)
def create_expense(
    expense_data: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense_service = ExpenseService(db)
    return expense_service.create_expense(expense_data)


@router.get("/event/{event_id}", response_model=List[ExpenseResponse])
def get_event_expenses(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense_service = ExpenseService(db)
    return expense_service.get_event_expenses(event_id)


@router.get("/{expense_id}", response_model=ExpenseResponse)
def get_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense_service = ExpenseService(db)
    return expense_service.get_expense_by_id(expense_id)


@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: int,
    expense_data: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense_service = ExpenseService(db)
    return expense_service.update_expense(expense_id, expense_data, current_user.id)


@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense_service = ExpenseService(db)
    return expense_service.delete_expense(expense_id, current_user.id)


@router.get("/event/{event_id}/balance", response_model=EventBalance)
def get_event_balance(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense_service = ExpenseService(db)
    return expense_service.calculate_balance(event_id)


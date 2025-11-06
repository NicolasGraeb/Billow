from sqlalchemy.orm import Session
from typing import List, Optional
from models.models import Expense, ExpenseParticipant


class ExpenseRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, expense: Expense) -> Expense:
        self.db.add(expense)
        self.db.commit()
        self.db.refresh(expense)
        return expense

    def get_by_id(self, expense_id: int) -> Optional[Expense]:
        return self.db.query(Expense).filter(Expense.id == expense_id).first()

    def get_by_event(self, event_id: int) -> List[Expense]:
        return self.db.query(Expense).filter(Expense.event_id == event_id).all()

    def update(self, expense: Expense) -> Expense:
        self.db.commit()
        self.db.refresh(expense)
        return expense

    def delete(self, expense: Expense):
        self.db.delete(expense)
        self.db.commit()


class ExpenseParticipantRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, participant: ExpenseParticipant) -> ExpenseParticipant:
        self.db.add(participant)
        self.db.commit()
        self.db.refresh(participant)
        return participant

    def create_many(self, participants: List[ExpenseParticipant]) -> List[ExpenseParticipant]:
        self.db.add_all(participants)
        self.db.commit()
        for p in participants:
            self.db.refresh(p)
        return participants


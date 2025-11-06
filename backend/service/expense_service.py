from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from repository.expense_repository import ExpenseRepository, ExpenseParticipantRepository
from repository.event_repository import EventRepository
from repository.user_repository import UserRepository
from service.event_service import EventService
from models.models import Expense, ExpenseParticipant, EventStatus
from schemas.expense_schemas import ExpenseCreate, BalanceEntry, ExpenseUpdate
from collections import defaultdict


class ExpenseService:
    def __init__(self, db: Session):
        self.expense_repo = ExpenseRepository(db)
        self.participant_repo = ExpenseParticipantRepository(db)
        self.event_repo = EventRepository(db)
        self.user_repo = UserRepository(db)
        self.event_service = EventService(db)
        self.db = db

    def create_expense(self, expense_data: ExpenseCreate) -> Expense:
        event = self.event_repo.get_by_id(expense_data.event_id)
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )
        
        self.event_service.check_event_active(event)
        
        payer = self.user_repo.get_by_id(expense_data.payer_id)
        if not payer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payer not found"
            )
        
        if payer not in event.participants:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payer must be an event participant"
            )
        
        total_participant_amount = sum(p.amount for p in expense_data.participants)
        if abs(total_participant_amount - expense_data.amount) > 0.01:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Sum of participant amounts ({total_participant_amount}) must equal expense amount ({expense_data.amount})"
            )
        
        participant_ids = [p.user_id for p in expense_data.participants]
        participants = [u for u in event.participants if u.id in participant_ids]
        if len(participants) != len(participant_ids):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="One or more participants are not event participants"
            )
        
        expense = Expense(
            event_id=expense_data.event_id,
            payer_id=expense_data.payer_id,
            amount=expense_data.amount,
            description=expense_data.description
        )
        expense = self.expense_repo.create(expense)
        
        expense_participants = [
            ExpenseParticipant(
                expense_id=expense.id,
                user_id=p.user_id,
                amount=p.amount
            )
            for p in expense_data.participants
        ]
        self.participant_repo.create_many(expense_participants)
        
        self.db.refresh(expense)
        return expense

    def get_expense_by_id(self, expense_id: int) -> Expense:
        expense = self.expense_repo.get_by_id(expense_id)
        if not expense:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Expense not found"
            )
        return expense

    def get_event_expenses(self, event_id: int):
        event = self.event_repo.get_by_id(event_id)
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )
        return self.expense_repo.get_by_event(event_id)

    def delete_expense(self, expense_id: int, user_id: int):
        expense = self.get_expense_by_id(expense_id)
        event = self.event_repo.get_by_id(expense.event_id)
        
        if not self.event_service.is_moderator(event, user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only event moderator can delete expenses"
            )
        
        self.event_service.check_event_active(event)
        
        self.expense_repo.delete(expense)
        return {"message": "Expense deleted successfully"}

    def update_expense(self, expense_id: int, expense_data: ExpenseUpdate, user_id: int) -> Expense:
        expense = self.get_expense_by_id(expense_id)
        event = self.event_repo.get_by_id(expense.event_id)
        
        if not self.event_service.is_moderator(event, user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only event moderator can update expenses"
            )
        
        self.event_service.check_event_active(event)
        
        new_amount = expense_data.amount if expense_data.amount is not None else expense.amount
        
        if expense_data.participants:
            total_participant_amount = sum(p.amount for p in expense_data.participants)
            if abs(total_participant_amount - new_amount) > 0.01:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Sum of participant amounts ({total_participant_amount}) must equal expense amount ({new_amount})"
                )
            
            participant_ids = [p.user_id for p in expense_data.participants]
            participants = [u for u in event.participants if u.id in participant_ids]
            if len(participants) != len(participant_ids):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="One or more participants are not event participants"
                )
        
        expense.amount = new_amount
        if expense_data.description is not None:
            expense.description = expense_data.description
        
        if expense_data.participants:
            for participant in expense.participants:
                self.db.delete(participant)
            self.db.flush()
            
            expense_participants = [
                ExpenseParticipant(
                    expense_id=expense.id,
                    user_id=p.user_id,
                    amount=p.amount
                )
                for p in expense_data.participants
            ]
            self.participant_repo.create_many(expense_participants)
        
        if expense_data.payer_id is not None:
            payer = self.user_repo.get_by_id(expense_data.payer_id)
            if not payer:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Payer not found"
                )
            if payer not in event.participants:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Payer must be an event participant"
                )
            expense.payer_id = expense_data.payer_id
        
        self.expense_repo.update(expense)
        self.db.refresh(expense)
        return expense

    def calculate_balance(self, event_id: int):
        event = self.event_repo.get_by_id(event_id)
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )
        
        expenses = self.expense_repo.get_by_event(event_id)
        
        net_balance = defaultdict(float)
        
        for expense in expenses:
            payer_id = expense.payer_id
            net_balance[payer_id] += expense.amount
            
            for participant in expense.participants:
                net_balance[participant.user_id] -= participant.amount
        
        users = {user.id: user for user in event.participants}
        
        summary = {}
        for user_id, balance in net_balance.items():
            user = users.get(user_id)
            if user:
                summary[user.username] = round(balance, 2)
        
        user_ids = list(users.keys())
        n = len(user_ids)
        user_to_idx = {uid: i for i, uid in enumerate(user_ids)}
        
        for user_id in user_ids:
            if user_id not in net_balance:
                net_balance[user_id] = 0.0
        
        debts = [[0.0] * n for _ in range(n)]
        
        receivers = [(uid, bal) for uid, bal in net_balance.items() if bal > 0.01]
        debtors = [(uid, abs(bal)) for uid, bal in net_balance.items() if bal < -0.01]
        
        receivers.sort(key=lambda x: x[1], reverse=True)
        debtors.sort(key=lambda x: x[1], reverse=True)
        
        receiver_idx = 0
        debtor_idx = 0
        
        while debtor_idx < len(debtors) and receiver_idx < len(receivers):
            debtor_id, remaining_debt = debtors[debtor_idx]
            receiver_id, remaining_credit = receivers[receiver_idx]
            
            if remaining_debt > 0.01 and remaining_credit > 0.01:
                transfer = min(remaining_debt, remaining_credit)
                debts[user_to_idx[debtor_id]][user_to_idx[receiver_id]] = transfer
                
                debtors[debtor_idx] = (debtor_id, remaining_debt - transfer)
                receivers[receiver_idx] = (receiver_id, remaining_credit - transfer)
            
            if debtors[debtor_idx][1] < 0.01:
                debtor_idx += 1
            if receivers[receiver_idx][1] < 0.01:
                receiver_idx += 1
        
        changed = True
        max_iterations = n * n
        iteration = 0
        
        while changed and iteration < max_iterations:
            changed = False
            iteration += 1
            
            for i in range(n):
                for j in range(n):
                    if i == j:
                        continue
                    for k in range(n):
                        if k == j or k == i:
                            continue
                        
                        if debts[i][j] > 0.01 and debts[j][k] > 0.01:
                            min_transfer = min(debts[i][j], debts[j][k])
                            debts[i][j] -= min_transfer
                            debts[j][k] -= min_transfer
                            debts[i][k] += min_transfer
                            changed = True
        
        balances = []
        for i in range(n):
            for j in range(n):
                if debts[i][j] > 0.01:
                    debtor_id = user_ids[i]
                    receiver_id = user_ids[j]
                    balances.append(BalanceEntry(
                        from_user_id=debtor_id,
                        to_user_id=receiver_id,
                        amount=round(debts[i][j], 2),
                        from_user=users[debtor_id],
                        to_user=users[receiver_id]
                    ))
        
        from schemas.expense_schemas import EventBalance
        return EventBalance(
            event_id=event_id,
            balances=balances,
            summary=summary
        )

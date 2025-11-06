from sqlalchemy.orm import Session
from typing import List, Optional
from models.models import Event, User


class EventRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, event: Event) -> Event:
        self.db.add(event)
        self.db.commit()
        self.db.refresh(event)
        return event

    def get_by_id(self, event_id: int) -> Optional[Event]:
        return self.db.query(Event).filter(Event.id == event_id).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[Event]:
        return self.db.query(Event).offset(skip).limit(limit).all()

    def get_by_user(self, user_id: int) -> List[Event]:
        return self.db.query(Event).filter(Event.participants.any(User.id == user_id)).all()
    
    def get_by_user_active(self, user_id: int, skip: int = 0, limit: int = 100) -> List[Event]:
        from models.models import EventStatus
        return self.db.query(Event).filter(
            Event.participants.any(User.id == user_id),
            Event.status == EventStatus.ACTIVE
        ).offset(skip).limit(limit).all()

    def add_participant(self, event: Event, user: User):
        if user not in event.participants:
            event.participants.append(user)
            self.db.commit()
            self.db.refresh(event)

    def remove_participant(self, event: Event, user: User):
        if user in event.participants:
            event.participants.remove(user)
            self.db.commit()
            self.db.refresh(event)

    def update(self, event: Event) -> Event:
        self.db.commit()
        self.db.refresh(event)
        return event

    def delete(self, event: Event):
        self.db.delete(event)
        self.db.commit()


from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from repository.event_repository import EventRepository
from repository.user_repository import UserRepository
from models.models import Event, User, EventStatus
from schemas.event_schemas import EventCreate
from datetime import datetime


class EventService:
    def __init__(self, db: Session):
        self.event_repo = EventRepository(db)
        self.user_repo = UserRepository(db)
        self.db = db

    def create_event(self, event_data: EventCreate, creator_id: int) -> Event:
        participants = []
        if event_data.participant_ids:
            participants = self.user_repo.get_all()
            participants = [u for u in participants if u.id in event_data.participant_ids]
            if len(participants) != len(event_data.participant_ids):
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="One or more users not found"
                )
        
        creator = self.user_repo.get_by_id(creator_id)
        if creator not in participants:
            participants.append(creator)
        
        event = Event(
            name=event_data.name,
            description=event_data.description,
            created_by=creator_id
        )
        event.participants = participants
        return self.event_repo.create(event)

    def get_event_by_id(self, event_id: int) -> Event:
        event = self.event_repo.get_by_id(event_id)
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )
        return event

    def get_all_events(self, skip: int = 0, limit: int = 100):
        return self.event_repo.get_all(skip, limit)
    
    def get_user_events(self, user_id: int):
        return self.event_repo.get_by_user(user_id)
    
    def get_user_active_events(self, user_id: int, skip: int = 0, limit: int = 100):
        return self.event_repo.get_by_user_active(user_id, skip, limit)

    def add_participant(self, event_id: int, user_id: int, moderator_id: int) -> Event:
        event = self.get_event_by_id(event_id)
        
        if not self.is_moderator(event, moderator_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only event moderator can add participants"
            )
        
        self.check_event_active(event)
        
        user = self.user_repo.get_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if user in event.participants:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User is already a participant"
            )
        
        self.event_repo.add_participant(event, user)
        return event

    def remove_participant(self, event_id: int, user_id: int, moderator_id: int) -> Event:
        event = self.get_event_by_id(event_id)
        
        if not self.is_moderator(event, moderator_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only event moderator can remove participants"
            )
        
        self.check_event_active(event)
        
        user = self.user_repo.get_by_id(user_id)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        if user.id == event.created_by:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot remove event creator"
            )
        
        self.event_repo.remove_participant(event, user)
        return event

    def is_moderator(self, event: Event, user_id: int) -> bool:
        return event.created_by == user_id

    def finish_event(self, event_id: int, user_id: int) -> Event:
        event = self.get_event_by_id(event_id)
        
        if not self.is_moderator(event, user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only event moderator can finish the event"
            )
        
        if event.status == EventStatus.FINISHED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Event is already finished"
            )
        
        event.status = EventStatus.FINISHED
        event.finished_at = datetime.utcnow()
        return self.event_repo.update(event)

    def check_event_active(self, event: Event):
        if event.status == EventStatus.FINISHED:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot modify expenses in a finished event"
            )


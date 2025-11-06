from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from auth.dependencies import get_db, get_current_user
from service.event_service import EventService
from schemas.event_schemas import EventCreate, EventResponse, EventUpdate
from models.models import User

router = APIRouter(prefix="/events", tags=["events"])


@router.post("/", response_model=EventResponse, status_code=201)
def create_event(
    event_data: EventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    event_service = EventService(db)
    return event_service.create_event(event_data, current_user.id)


@router.get("/", response_model=List[EventResponse])
def get_events(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event_service = EventService(db)
    return event_service.get_all_events(skip, limit)


@router.get("/me", response_model=List[EventResponse])
def get_user_events(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event_service = EventService(db)
    return event_service.get_user_events(current_user.id)


@router.get("/me/active", response_model=List[EventResponse])
def get_user_active_events(
    skip: int = 0,
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event_service = EventService(db)
    return event_service.get_user_active_events(current_user.id, skip, limit)


@router.get("/{event_id}", response_model=EventResponse)
def get_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event_service = EventService(db)
    return event_service.get_event_by_id(event_id)


@router.post("/{event_id}/participants/{user_id}", response_model=EventResponse)
def add_participant(
    event_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event_service = EventService(db)
    return event_service.add_participant(event_id, user_id, current_user.id)


@router.delete("/{event_id}/participants/{user_id}", response_model=EventResponse)
def remove_participant(
    event_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event_service = EventService(db)
    return event_service.remove_participant(event_id, user_id, current_user.id)


@router.post("/{event_id}/finish", response_model=EventResponse)
def finish_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    event_service = EventService(db)
    return event_service.finish_event(event_id, current_user.id)


from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from auth.dependencies import get_db, get_current_user
from service.user_service import FriendshipService
from schemas.friendship_schemas import FriendshipResponse, FriendshipRequestResponse
from models.models import User

router = APIRouter(prefix="/friends", tags=["friendships"])


@router.post("/request/{friend_id}", response_model=FriendshipResponse)
def send_friend_request(
    friend_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    friendship_service = FriendshipService(db)
    return friendship_service.send_friend_request(current_user.id, friend_id)


@router.get("/requests/pending", response_model=List[FriendshipRequestResponse])
def get_pending_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    friendship_service = FriendshipService(db)
    requests = friendship_service.get_pending_requests(current_user.id)
    result = []
    for req in requests:
        result.append(FriendshipRequestResponse(
            id=req.id,
            from_user=req.user,
            to_user=req.friend,
            status=req.status.value,
            created_at=req.created_at
        ))
    return result


@router.get("/requests/sent", response_model=List[FriendshipRequestResponse])
def get_sent_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    friendship_service = FriendshipService(db)
    requests = friendship_service.get_sent_requests(current_user.id)
    result = []
    for req in requests:
        result.append(FriendshipRequestResponse(
            id=req.id,
            from_user=req.user,
            to_user=req.friend,
            status=req.status.value,
            created_at=req.created_at
        ))
    return result


@router.post("/{friendship_id}/accept", response_model=FriendshipResponse)
def accept_friend_request(
    friendship_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    friendship_service = FriendshipService(db)
    return friendship_service.accept_friend_request(current_user.id, friendship_id)


@router.post("/{friendship_id}/reject", response_model=FriendshipResponse)
def reject_friend_request(
    friendship_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    friendship_service = FriendshipService(db)
    return friendship_service.reject_friend_request(current_user.id, friendship_id)


@router.get("/", response_model=List[FriendshipResponse])
def get_friends(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    friendship_service = FriendshipService(db)
    friendships = friendship_service.get_friends(current_user.id)
    return friendships


@router.delete("/{friendship_id}")
def remove_friend(
    friendship_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    friendship_service = FriendshipService(db)
    return friendship_service.remove_friend(current_user.id, friendship_id)


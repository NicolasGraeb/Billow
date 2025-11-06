from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from auth.dependencies import get_db, get_current_user
from service.user_service import UserService
from schemas.user_schemas import UserResponse, UserUpdate
from models.models import User

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=List[UserResponse])
def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_service = UserService(db)
    return user_service.get_all_users(skip, limit)


@router.get("/search", response_model=List[UserResponse])
def search_users(
    q: str,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not q or len(q.strip()) < 2:
        return []
    user_service = UserService(db)
    skip = (page - 1) * limit
    users = user_service.search_users(q.strip(), skip, limit)
    return [u for u in users if u.id != current_user.id]


@router.get("/friendship-status/{user_id}")
def get_friendship_status(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from service.user_service import FriendshipService
    friendship_service = FriendshipService(db)
    friendship = friendship_service.friendship_repo.get_by_ids(current_user.id, user_id)
    
    if not friendship:
        return {"status": "none"}
    
    return {
        "status": friendship.status.value,
        "friendship_id": friendship.id,
        "is_sender": friendship.user_id == current_user.id
    }


@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_service = UserService(db)
    return user_service.get_user_by_id(user_id)


@router.put("/me", response_model=UserResponse)
def update_user(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_service = UserService(db)
    return user_service.update_user(current_user, user_data)


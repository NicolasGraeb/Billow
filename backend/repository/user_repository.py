from sqlalchemy.orm import Session
from typing import Optional, List
from models.models import User, Friendship, FriendshipStatus


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def get_by_id(self, user_id: int) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_username(self, username: str) -> Optional[User]:
        return self.db.query(User).filter(User.username == username).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def get_by_reset_token(self, token: str) -> Optional[User]:
        return self.db.query(User).filter(User.reset_token == token).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[User]:
        return self.db.query(User).offset(skip).limit(limit).all()
    
    def search_by_username(self, query: str, skip: int = 0, limit: int = 20) -> List[User]:
        return self.db.query(User).filter(
            User.username.ilike(f"%{query}%")
        ).offset(skip).limit(limit).all()

    def update(self, user: User) -> User:
        self.db.commit()
        self.db.refresh(user)
        return user

    def delete(self, user: User):
        self.db.delete(user)
        self.db.commit()


class FriendshipRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, friendship: Friendship) -> Friendship:
        self.db.add(friendship)
        self.db.commit()
        self.db.refresh(friendship)
        return friendship

    def get_by_ids(self, user_id: int, friend_id: int) -> Optional[Friendship]:
        return self.db.query(Friendship).filter(
            ((Friendship.user_id == user_id) & (Friendship.friend_id == friend_id)) |
            ((Friendship.user_id == friend_id) & (Friendship.friend_id == user_id))
        ).first()

    def get_friendships_by_user(self, user_id: int, status: Optional[FriendshipStatus] = None) -> List[Friendship]:
        query = self.db.query(Friendship).filter(
            (Friendship.user_id == user_id) | (Friendship.friend_id == user_id)
        )
        if status:
            query = query.filter(Friendship.status == status)
        return query.all()

    def get_pending_requests(self, user_id: int) -> List[Friendship]:
        return self.db.query(Friendship).filter(
            Friendship.friend_id == user_id,
            Friendship.status == FriendshipStatus.PENDING
        ).all()
    
    def get_sent_requests(self, user_id: int) -> List[Friendship]:
        return self.db.query(Friendship).filter(
            Friendship.user_id == user_id,
            Friendship.status == FriendshipStatus.PENDING
        ).all()

    def update(self, friendship: Friendship) -> Friendship:
        self.db.commit()
        self.db.refresh(friendship)
        return friendship

    def delete(self, friendship: Friendship):
        self.db.delete(friendship)
        self.db.commit()
    
    def count_friends(self, user_id: int) -> int:
        """Count accepted friendships for a user"""
        return self.db.query(Friendship).filter(
            ((Friendship.user_id == user_id) | (Friendship.friend_id == user_id)),
            Friendship.status == FriendshipStatus.ACCEPTED
        ).count()


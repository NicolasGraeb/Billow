from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from repository.user_repository import UserRepository, FriendshipRepository
from models.models import User, Friendship, FriendshipStatus
from auth.jwt_handler import get_password_hash, verify_password, create_access_token, create_refresh_token, generate_reset_token
from schemas.user_schemas import UserCreate, UserUpdate, PasswordChange
from datetime import datetime, timedelta


class UserService:
    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)
        self.friendship_repo = FriendshipRepository(db)
        self.db = db

    def create_user(self, user_data: UserCreate) -> User:
        if self.user_repo.get_by_username(user_data.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        
        if self.user_repo.get_by_email(user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        hashed_password = get_password_hash(user_data.password)
        
        db_user = User(
            username=user_data.username,
            email=user_data.email,
            hashed_password=hashed_password
        )
        return self.user_repo.create(db_user)

    def authenticate_user(self, username: str, password: str) -> User:
        user = self.user_repo.get_by_username(username)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password"
            )
        
        if not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User is inactive"
            )
        
        return user

    def get_access_token(self, user: User) -> str:
        access_token = create_access_token(data={"sub": user.id})
        return access_token
    
    def get_refresh_token(self, user: User) -> str:
        refresh_token = create_refresh_token(data={"sub": user.id})
        return refresh_token
    
    def get_tokens(self, user: User) -> tuple[str, str]:
        access_token = create_access_token(data={"sub": user.id})
        refresh_token = create_refresh_token(data={"sub": user.id})
        return access_token, refresh_token

    def update_user(self, user: User, user_data: UserUpdate) -> User:
        if user_data.username and user_data.username != user.username:
            if self.user_repo.get_by_username(user_data.username):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken"
                )
            user.username = user_data.username
        
        if user_data.email and user_data.email != user.email:
            if self.user_repo.get_by_email(user_data.email):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already taken"
                )
            user.email = user_data.email
        
        return self.user_repo.update(user)

    def change_password(self, user: User, password_data: PasswordChange) -> User:
        if not verify_password(password_data.current_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect"
            )
        
        user.hashed_password = get_password_hash(password_data.new_password)
        return self.user_repo.update(user)

    def request_password_reset(self, email: str) -> str:
        user = self.user_repo.get_by_email(email)
        if not user:
            return ""
        
        reset_token = generate_reset_token()
        user.reset_token = reset_token
        user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
        self.user_repo.update(user)
        
        return reset_token

    def reset_password(self, token: str, new_password: str) -> User:
        user = self.user_repo.get_by_reset_token(token)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid reset token"
            )
        
        if user.reset_token_expires and user.reset_token_expires < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Reset token has expired"
            )
        
        user.hashed_password = get_password_hash(new_password)
        user.reset_token = None
        user.reset_token_expires = None
        return self.user_repo.update(user)

    def get_user_by_id(self, user_id: int) -> User:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        return user

    def get_all_users(self, skip: int = 0, limit: int = 100):
        return self.user_repo.get_all(skip, limit)
    
    def search_users(self, query: str, skip: int = 0, limit: int = 20):
        return self.user_repo.search_by_username(query, skip, limit)
    
    def get_user_profile_with_friends_count(self, user_id: int) -> dict:
        """Get user profile with friends count"""
        user = self.get_user_by_id(user_id)
        friends_count = self.friendship_repo.count_friends(user_id)
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_active": user.is_active,
            "created_at": user.created_at,
            "friends_count": friends_count
        }


class FriendshipService:
    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)
        self.friendship_repo = FriendshipRepository(db)
        self.db = db

    def send_friend_request(self, user_id: int, friend_id: int) -> Friendship:
        if user_id == friend_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot send friend request to yourself"
            )
        
        user = self.user_repo.get_by_id(user_id)
        friend = self.user_repo.get_by_id(friend_id)
        
        if not user or not friend:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        existing = self.friendship_repo.get_by_ids(user_id, friend_id)
        if existing:
            if existing.status == FriendshipStatus.PENDING:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Friend request already pending"
                )
            elif existing.status == FriendshipStatus.ACCEPTED:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Users are already friends"
                )
            self.friendship_repo.delete(existing)
        
        friendship = Friendship(
            user_id=user_id,
            friend_id=friend_id,
            status=FriendshipStatus.PENDING
        )
        return self.friendship_repo.create(friendship)

    def accept_friend_request(self, user_id: int, friendship_id: int) -> Friendship:
        friendship = self.db.query(Friendship).filter(Friendship.id == friendship_id).first()
        
        if not friendship:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Friendship request not found"
            )
        
        if friendship.friend_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot accept this request. You can only accept requests sent to you."
            )
        
        if friendship.status != FriendshipStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Request is not pending"
            )
        
        friendship.status = FriendshipStatus.ACCEPTED
        return self.friendship_repo.update(friendship)

    def reject_friend_request(self, user_id: int, friendship_id: int) -> Friendship:
        friendship = self.db.query(Friendship).filter(Friendship.id == friendship_id).first()
        
        if not friendship:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Friendship request not found"
            )
        
        if friendship.friend_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot reject this request. You can only reject requests sent to you."
            )
        
        if friendship.status != FriendshipStatus.PENDING:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Request is not pending"
            )
        
        friendship.status = FriendshipStatus.REJECTED
        return self.friendship_repo.update(friendship)

    def get_pending_requests(self, user_id: int):
        return self.friendship_repo.get_pending_requests(user_id)
    
    def get_sent_requests(self, user_id: int):
        return self.friendship_repo.get_sent_requests(user_id)

    def get_friends(self, user_id: int):
        friendships = self.friendship_repo.get_friendships_by_user(
            user_id, 
            FriendshipStatus.ACCEPTED
        )
        return friendships

    def remove_friend(self, user_id: int, friendship_id: int):
        friendship = self.friendship_repo.get_friendships_by_user(user_id)
        friendship = next((f for f in friendship if f.id == friendship_id), None)
        
        if not friendship:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Friendship not found"
            )
        
        self.friendship_repo.delete(friendship)
        return {"message": "Friendship removed"}

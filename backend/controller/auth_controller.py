from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from auth.dependencies import get_db, get_current_user
from service.user_service import UserService
from schemas.user_schemas import (
    UserCreate, UserLogin, TokenResponse, UserResponse,
    PasswordResetRequest, PasswordReset, PasswordChange
)
from models.models import User
from auth.jwt_handler import decode_refresh_token

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    user_service = UserService(db)
    user = user_service.create_user(user_data)
    return user


@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user_service = UserService(db)
    user = user_service.authenticate_user(credentials.username, credentials.password)
    access_token, refresh_tkn = user_service.get_tokens(user)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_tkn,
        user=user
    )


@router.post("/password-reset-request")
def password_reset_request(request: PasswordResetRequest, db: Session = Depends(get_db)):
    user_service = UserService(db)
    token = user_service.request_password_reset(request.email)
    return {"message": "If email exists, reset token has been generated"}


@router.post("/password-reset")
def password_reset(reset_data: PasswordReset, db: Session = Depends(get_db)):
    user_service = UserService(db)
    user = user_service.reset_password(reset_data.token, reset_data.new_password)
    return {"message": "Password has been reset successfully"}


@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_service = UserService(db)
    profile = user_service.get_user_profile_with_friends_count(current_user.id)
    return profile


@router.post("/change-password")
def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_service = UserService(db)
    user_service.change_password(current_user, password_data)
    return {"message": "Password changed successfully"}


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication header format"
        )
    
    refresh_token_str = parts[1]
    payload = decode_refresh_token(refresh_token_str)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    user_id_str = payload.get("sub")
    if user_id_str is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    try:
        user_id = int(user_id_str)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    user_service = UserService(db)
    user = user_service.get_user_by_id(user_id)
    
    access_token, new_refresh_token = user_service.get_tokens(user)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        user=user
    )


from controller.auth_controller import router as auth_router
from controller.user_controller import router as user_router
from controller.friendship_controller import router as friendship_router
from controller.event_controller import router as event_router
from controller.expense_controller import router as expense_router

__all__ = [
    "auth_router",
    "user_router",
    "friendship_router",
    "event_router",
    "expense_router"
]


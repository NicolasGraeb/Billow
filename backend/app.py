from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controller import (
    auth_router,
    user_router,
    friendship_router,
    event_router,
    expense_router
)
from auth.middleware import JWTAuthMiddleware

app = FastAPI(
    title="Billow",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(JWTAuthMiddleware)

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(friendship_router)
app.include_router(event_router)
app.include_router(expense_router)


@app.get("/")
def root():
    return {
        "message": "Welcome to Billow API",
        "docs": "/docs",
        "version": "2.0.0"
    }

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
from fastapi import status
from auth.jwt_handler import decode_access_token


class JWTAuthMiddleware(BaseHTTPMiddleware):
    
    EXCLUDED_PATHS = [
        "/auth/login",
        "/auth/register",
        "/auth/refresh",
        "/docs",
        "/openapi.json",
        "/redoc",
        "/"
    ]
    
    async def dispatch(self, request: Request, call_next):
        if request.url.path in self.EXCLUDED_PATHS or request.url.path.startswith("/docs") or request.url.path.startswith("/openapi.json"):
            return await call_next(request)
        
        if request.method == "OPTIONS":
            return await call_next(request)
        
        authorization = request.headers.get("Authorization")
        
        if not authorization:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Not authenticated"},
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        parts = authorization.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Invalid authentication header format"},
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        token = parts[1]
        
        payload = decode_access_token(token)
        
        if payload is None:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Could not validate credentials"},
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        user_id = payload.get("sub")
        if not user_id:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Invalid token payload"},
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        request.state.user_id = int(user_id) if isinstance(user_id, str) else user_id
        
        response = await call_next(request)
        return response


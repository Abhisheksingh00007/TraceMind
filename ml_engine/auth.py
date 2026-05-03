from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "fallback_secret_key")
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    """Password ko encrypt karta hai"""
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    """Login ke time password check karta hai"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict):
    """User ke login hone par JWT token generate karta hai (Valid for 24 hours)"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

from fastapi import HTTPException, Request

def verify_token(request: Request):
    """Request header se JWT token nikal kar user ka email return karta hai"""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized access")
    
    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("email")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return email
    except Exception:
        raise HTTPException(status_code=401, detail="Token expired or invalid")
# backend/auth/models.py
from pydantic import BaseModel, EmailStr

class RegisterModel(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginModel(BaseModel):
    email: EmailStr
    password: str

class ForgotModel(BaseModel):
    email: EmailStr

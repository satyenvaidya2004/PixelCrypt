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

class VerifyOTPModel(BaseModel):
    name: str | None = None
    email: EmailStr
    password: str | None = None
    otp: str

class ResetPasswordModel(BaseModel):
    email: EmailStr
    otp: str
    new_password: str
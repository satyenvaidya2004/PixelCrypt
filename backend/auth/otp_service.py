import random
from datetime import datetime, timedelta

OTP_EXPIRY_MINUTES = 10

def generate_otp() -> str:
    return str(random.randint(100000, 999999))

def expiry_time():
    return datetime.utcnow() + timedelta(minutes=OTP_EXPIRY_MINUTES)

import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

BASE_DIR = Path(__file__).resolve().parents[1]
TEMPLATE_PATH = BASE_DIR / "email_templates" / "otp_email.html"

def send_otp_email(to_email: str, otp: str):
    # Load HTML template
    html = TEMPLATE_PATH.read_text(encoding="utf-8")
    html = html.replace("{{OTP}}", otp)

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "PixelCrypt | OTP Verification"
    msg["From"] = f"PixelCrypt <{SMTP_EMAIL}>"
    msg["To"] = to_email

    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.send_message(msg)

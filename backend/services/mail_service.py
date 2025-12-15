import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

def send_otp_email(to_email: str, otp: str):
    sender_email = os.getenv("EMAIL_USER")
    app_password = os.getenv("EMAIL_APP_PASSWORD")

    template_path = BASE_DIR / "email_templates" / "otp_email.html"
    html = template_path.read_text(encoding="utf-8")
    html = html.replace("{{OTP}}", otp)

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "PixelCrypt | OTP Verification"
    msg["From"] = f"PixelCrypt <{sender_email}>"
    msg["To"] = to_email

    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(sender_email, app_password)
        server.send_message(msg)

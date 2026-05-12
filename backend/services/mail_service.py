import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

def send_otp_email(to_email: str, otp: str):
    sender_email = os.getenv("SMTP_EMAIL")
    app_password = os.getenv("SMTP_PASSWORD")
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", 587))

    try:
        template_path = BASE_DIR / "email_templates" / "otp_email.html"
        html = template_path.read_text(encoding="utf-8")
        html = html.replace("{{OTP}}", otp)

        msg = MIMEMultipart("alternative")
        msg["Subject"] = "PixelCrypt | OTP Verification"
        msg["From"] = f"PixelCrypt <{sender_email}>"
        msg["To"] = to_email

        msg.attach(MIMEText(html, "html"))

        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_server, smtp_port) as server:
                server.login(sender_email, app_password)
                server.send_message(msg)
        else:
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls()
                server.login(sender_email, app_password)
                server.send_message(msg)
        
        print(f"✅ OTP sent successfully to {to_email}")
    except Exception as e:
        print(f"❌ Failed to send email: {str(e)}")
        raise e

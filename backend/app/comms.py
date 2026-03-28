import smtplib
import os
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()

def send_nia_alert(subject, body):
    msg = EmailMessage()
    msg.set_content(body)
    msg['Subject'] = f"NIA-EVO ALERT: {subject}"
    msg['From'] = os.getenv("GMAIL_USER")
    msg['To'] = os.getenv("GMAIL_USER")

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(os.getenv("GMAIL_USER"), os.getenv("GMAIL_APP_PASSWORD"))
            smtp.send_message(msg)
        return True
    except Exception as e:
        print(f"Comms Error: {e}")
        return False

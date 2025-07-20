import os
import secrets
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class EmailService:
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.from_email = os.getenv("FROM_EMAIL")
        self.from_name = os.getenv("FROM_NAME", "Feedback System")
        self.frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

    def generate_verification_token(self):
        """Generate a secure verification token"""
        return secrets.token_urlsafe(32)

    def get_token_expiry(self):
        """Get token expiry time (24 hours from now)"""
        return datetime.utcnow() + timedelta(hours=24)

    async def send_verification_email(self, to_email: str, full_name: str, verification_token: str):
        """Send email verification email"""
        verification_url = f"{self.frontend_url}/verify-email?token={verification_token}"
        
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = "Verify Your Email - Feedback System"
        message["From"] = f"{self.from_name} <{self.from_email}>"
        message["To"] = to_email

        # Create HTML content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Feedback System!</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
                <h2 style="color: #495057; margin-top: 0;">Hi {full_name},</h2>
                
                <p style="font-size: 16px; margin-bottom: 25px;">
                    Thank you for joining our Feedback System! To complete your registration and start using the platform, 
                    please verify your email address by clicking the button below.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{verification_url}" 
                       style="background: #4f46e5; color: white; padding: 15px 30px; text-decoration: none; 
                              border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;
                              box-shadow: 0 4px 6px rgba(79, 70, 229, 0.3);">
                        Verify Email Address
                    </a>
                </div>
                
                <p style="font-size: 14px; color: #6c757d; margin-top: 25px;">
                    If the button doesn't work, you can copy and paste this link into your browser:
                </p>
                <p style="font-size: 14px; color: #4f46e5; word-break: break-all; background: #f1f3f4; padding: 10px; border-radius: 5px;">
                    {verification_url}
                </p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                    <p style="font-size: 14px; color: #6c757d; margin: 0;">
                        <strong>Note:</strong> This verification link will expire in 24 hours for security reasons.
                    </p>
                    <p style="font-size: 14px; color: #6c757d; margin: 10px 0 0 0;">
                        If you didn't create an account with us, please ignore this email.
                    </p>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;">
                <p>© 2024 Feedback System. All rights reserved.</p>
            </div>
        </body>
        </html>
        """

        # Create plain text version
        text_content = f"""
        Welcome to Feedback System!
        
        Hi {full_name},
        
        Thank you for joining our Feedback System! To complete your registration and start using the platform, 
        please verify your email address by visiting the following link:
        
        {verification_url}
        
        This verification link will expire in 24 hours for security reasons.
        
        If you didn't create an account with us, please ignore this email.
        
        Best regards,
        Feedback System Team
        """

        # Attach parts
        text_part = MIMEText(text_content, "plain")
        html_part = MIMEText(html_content, "html")
        
        message.attach(text_part)
        message.attach(html_part)

        # Send email
        try:
            await aiosmtplib.send(
                message,
                hostname=self.smtp_server,
                port=self.smtp_port,
                start_tls=True,
                username=self.smtp_username,
                password=self.smtp_password,
            )
            return True
        except Exception as e:
            print(f"Failed to send email: {e}")
            return False

    async def send_welcome_email(self, to_email: str, full_name: str, role: str, temp_password: str):
        """Send welcome email with login credentials"""
        
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = "Welcome to Feedback System - Your Account Details"
        message["From"] = f"{self.from_name} <{self.from_email}>"
        message["To"] = to_email

        # Create HTML content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Feedback System</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Feedback System!</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
                <h2 style="color: #495057; margin-top: 0;">Hi {full_name},</h2>
                
                <p style="font-size: 16px; margin-bottom: 25px;">
                    Your account has been successfully created! You can now access the Feedback System with the following credentials:
                </p>
                
                <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0;">
                    <h3 style="margin-top: 0; color: #1565c0;">Your Login Details:</h3>
                    <p style="margin: 10px 0;"><strong>Email:</strong> {to_email}</p>
                    <p style="margin: 10px 0;"><strong>Temporary Password:</strong> <code style="background: #fff; padding: 4px 8px; border-radius: 4px; color: #d32f2f;">{temp_password}</code></p>
                    <p style="margin: 10px 0;"><strong>Role:</strong> {role.title()}</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{self.frontend_url}/login" 
                       style="background: #4f46e5; color: white; padding: 15px 30px; text-decoration: none; 
                              border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;
                              box-shadow: 0 4px 6px rgba(79, 70, 229, 0.3);">
                        Login to Your Account
                    </a>
                </div>
                
                <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 25px 0;">
                    <h4 style="margin-top: 0; color: #856404;">🔒 Security Reminder:</h4>
                    <p style="margin: 0; color: #856404; font-size: 14px;">
                        Please change your password after your first login for security purposes. 
                        You can do this from your profile settings.
                    </p>
                </div>
                
                <div style="margin-top: 30px;">
                    <h4 style="color: #495057;">What you can do as a {role.title()}:</h4>
                    <ul style="color: #6c757d; font-size: 14px;">
                        {"<li>Create and manage feedback for your team members</li><li>View team performance dashboard</li><li>Manage feedback requests</li><li>Create new user accounts</li>" if role == "manager" else "<li>View feedback received from your manager</li><li>Request feedback proactively</li><li>Acknowledge received feedback</li><li>Track your feedback history</li>"}
                    </ul>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #6c757d; font-size: 12px;">
                <p>© 2024 Feedback System. All rights reserved.</p>
                <p>If you have any questions, please contact your system administrator.</p>
            </div>
        </body>
        </html>
        """

        # Create plain text version
        text_content = f"""
        Welcome to Feedback System!
        
        Hi {full_name},
        
        Your account has been successfully created! You can now access the Feedback System with the following credentials:
        
        Email: {to_email}
        Temporary Password: {temp_password}
        Role: {role.title()}
        
        Login URL: {self.frontend_url}/login
        
        Security Reminder: Please change your password after your first login for security purposes.
        
        Best regards,
        Feedback System Team
        """

        # Attach parts
        text_part = MIMEText(text_content, "plain")
        html_part = MIMEText(html_content, "html")
        
        message.attach(text_part)
        message.attach(html_part)

        # Send email
        try:
            await aiosmtplib.send(
                message,
                hostname=self.smtp_server,
                port=self.smtp_port,
                start_tls=True,
                username=self.smtp_username,
                password=self.smtp_password,
            )
            return True
        except Exception as e:
            print(f"Failed to send welcome email: {e}")
            return False

# Create global instance
email_service = EmailService()
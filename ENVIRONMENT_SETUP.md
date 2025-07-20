# Environment Setup Guide

## 🔧 Environment Configuration

This guide will help you set up the environment variables for both the backend and frontend of the Feedback System.

## 📁 Environment Files Structure

```
feedback-system/
├── backend/
│   ├── .env                 # Your actual environment variables (DO NOT COMMIT)
│   └── .env.sample         # Sample environment file (safe to commit)
└── frontend/
    ├── .env                # Your actual environment variables (DO NOT COMMIT)
    └── .env.sample        # Sample environment file (safe to commit)
```

## 🚀 Quick Setup

### 1. Backend Environment Setup

```bash
cd backend
cp .env.sample .env
```

Then edit the `.env` file with your actual values:

```env
# Required: Change these values
SECRET_KEY=your-unique-secret-key-here
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
FROM_EMAIL=your-email@gmail.com
```

### 2. Frontend Environment Setup

```bash
cd frontend
cp .env.sample .env
```

Edit the `.env` file if needed (defaults should work for development):

```env
# Usually defaults are fine for development
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_NAME=Your Company Feedback System
```

## 🔐 Backend Environment Variables

### 🔑 **Required Variables**

| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | JWT secret key (generate a strong one) | `your-secret-key-jwt-auth-2024` |
| `SMTP_USERNAME` | Gmail address for sending emails | `yourname@gmail.com` |
| `SMTP_PASSWORD` | Gmail app-specific password | `abcd efgh ijkl mnop` |
| `FROM_EMAIL` | Email address shown as sender | `yourname@gmail.com` |

### 📧 **Email Configuration**

To set up Gmail SMTP:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in `SMTP_PASSWORD`

### 🗄️ **Database Configuration**

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `sqlite:///./feedback_system.db` |
| `DB_POOL_SIZE` | Connection pool size | `5` |
| `DB_MAX_OVERFLOW` | Max overflow connections | `10` |

### 🔒 **Security Configuration**

| Variable | Description | Default |
|----------|-------------|---------|
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_HOURS` | Token expiry time | `24` |
| `BCRYPT_ROUNDS` | Password hashing rounds | `12` |
| `VERIFICATION_TOKEN_EXPIRE_HOURS` | Email verification expiry | `24` |

### 🌐 **CORS Configuration**

| Variable | Description | Example |
|----------|-------------|---------|
| `CORS_ORIGINS` | Allowed frontend origins | `http://localhost:3000,https://yourdomain.com` |
| `FRONTEND_URL` | Frontend URL for email links | `http://localhost:3000` |

### 📊 **Rate Limiting**

| Variable | Description | Default |
|----------|-------------|---------|
| `RATE_LIMIT_LOGIN` | Login attempts per minute | `5` |
| `RATE_LIMIT_VERIFICATION` | Verification emails per minute | `3` |
| `RATE_LIMIT_API` | API requests per minute | `100` |

## 🎨 Frontend Environment Variables

### 🔗 **API Configuration**

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_BASE_URL` | Backend API URL | `http://localhost:8000` |
| `REACT_APP_API_TIMEOUT` | Request timeout (ms) | `10000` |

### 🏷️ **Application Branding**

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_NAME` | Application name | `Feedback System` |
| `REACT_APP_COMPANY_NAME` | Your company name | `Your Company` |
| `REACT_APP_SUPPORT_EMAIL` | Support contact email | `support@yourcompany.com` |

### 🎛️ **Feature Flags**

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_ENABLE_NOTIFICATIONS` | Enable toast notifications | `true` |
| `REACT_APP_ENABLE_DARK_MODE` | Enable dark mode toggle | `false` |
| `REACT_APP_ENABLE_ANALYTICS` | Enable analytics tracking | `false` |
| `REACT_APP_REDUX_DEVTOOLS` | Enable Redux DevTools | `true` |

### ⚙️ **UI Configuration**

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_ITEMS_PER_PAGE` | Pagination items per page | `10` |
| `REACT_APP_MAX_FEEDBACK_LENGTH` | Max feedback character limit | `5000` |
| `REACT_APP_NOTIFICATION_DURATION` | Toast notification duration (ms) | `5000` |

## 🌍 Environment-Specific Configurations

### 🔧 **Development Environment**

```env
# Backend (.env)
ENVIRONMENT=development
LOG_LEVEL=DEBUG
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Frontend (.env)
REACT_APP_ENVIRONMENT=development
REACT_APP_DEBUG_MODE=true
REACT_APP_REDUX_DEVTOOLS=true
GENERATE_SOURCEMAP=true
```

### 🚀 **Production Environment**

```env
# Backend (.env)
ENVIRONMENT=production
LOG_LEVEL=INFO
SECRET_KEY=very-strong-production-secret-key
DATABASE_URL=postgresql://user:pass@localhost/feedback_db
CORS_ORIGINS=https://yourdomain.com

# Frontend (.env)
REACT_APP_ENVIRONMENT=production
REACT_APP_API_BASE_URL=https://api.yourdomain.com
REACT_APP_DEBUG_MODE=false
REACT_APP_REDUX_DEVTOOLS=false
GENERATE_SOURCEMAP=false
```

### 🧪 **Testing Environment**

```env
# Backend (.env)
ENVIRONMENT=testing
DATABASE_URL=sqlite:///./test_feedback_system.db
LOG_LEVEL=WARNING

# Frontend (.env)
REACT_APP_ENVIRONMENT=testing
REACT_APP_API_BASE_URL=http://localhost:8001
```

## 🔐 Security Best Practices

### 🚨 **Important Security Notes**

1. **Never commit `.env` files** to version control
2. **Use strong, unique secret keys** for production
3. **Rotate secrets regularly** in production
4. **Use environment-specific configurations**
5. **Enable HTTPS in production**

### 🔑 **Generating Secure Keys**

```bash
# Generate a secure secret key
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Or use OpenSSL
openssl rand -base64 32
```

### 📧 **Gmail App Password Setup**

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification**
3. Scroll down to **App passwords**
4. Select **Mail** and generate password
5. Use the generated password in `SMTP_PASSWORD`

## 🐳 Docker Environment Variables

### **Docker Compose Example**

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    environment:
      - SECRET_KEY=${SECRET_KEY}
      - SMTP_USERNAME=${SMTP_USERNAME}
      - SMTP_PASSWORD=${SMTP_PASSWORD}
      - DATABASE_URL=${DATABASE_URL}
    env_file:
      - ./backend/.env
    ports:
      - "8000:8000"
```

### **Docker Run with Environment**

```bash
docker run -p 8000:8000 \
  -e SECRET_KEY=your-secret-key \
  -e SMTP_USERNAME=your-email@gmail.com \
  -e SMTP_PASSWORD=your-app-password \
  feedback-system-backend
```

## 🔍 Troubleshooting

### **Common Issues**

1. **Email not sending**:
   - Check Gmail app password is correct
   - Verify 2FA is enabled on Gmail
   - Check SMTP settings

2. **CORS errors**:
   - Verify `CORS_ORIGINS` includes your frontend URL
   - Check frontend `REACT_APP_API_BASE_URL`

3. **Database connection issues**:
   - Check `DATABASE_URL` format
   - Verify database file permissions
   - Run migration script: `python migrate_db.py`

4. **JWT token issues**:
   - Ensure `SECRET_KEY` is set and consistent
   - Check token expiry settings

### **Environment Validation**

```bash
# Backend - Check environment
cd backend
python -c "
import os
from dotenv import load_dotenv
load_dotenv()
print('SECRET_KEY:', '✓' if os.getenv('SECRET_KEY') else '✗')
print('SMTP_USERNAME:', '✓' if os.getenv('SMTP_USERNAME') else '✗')
print('SMTP_PASSWORD:', '✓' if os.getenv('SMTP_PASSWORD') else '✗')
"

# Frontend - Check environment
cd frontend
npm run start  # Will show environment validation errors if any
```

## 📋 Environment Checklist

### **Before First Run**

- [ ] Copied `.env.sample` to `.env` in both directories
- [ ] Set unique `SECRET_KEY` in backend
- [ ] Configured Gmail SMTP credentials
- [ ] Updated `REACT_APP_API_BASE_URL` if needed
- [ ] Ran database migration: `python migrate_db.py`

### **Before Production Deployment**

- [ ] Generated strong production secret keys
- [ ] Configured production database URL
- [ ] Set production CORS origins
- [ ] Disabled debug modes
- [ ] Configured production email settings
- [ ] Set up proper logging
- [ ] Configured backup settings

## 🆘 Support

If you encounter issues with environment setup:

1. Check the troubleshooting section above
2. Verify all required variables are set
3. Check the application logs for specific error messages
4. Ensure all services (database, email) are accessible

Remember: **Never commit your actual `.env` files to version control!**
# Lightweight Feedback System

A comprehensive tool for internal feedback sharing between managers and team members at a company, built with modern web technologies and enterprise-level features.

## 🚀 Features

### ✅ Core Features (MVP)

- **Authentication & Roles**: Manager and Employee roles with JWT-based authentication
- **Email Verification**: Complete email verification system with professional templates
- **Feedback Submission**: Structured feedback with strengths, areas to improve, and sentiment analysis
- **Feedback Visibility**: Role-based access control with secure data isolation
- **Dashboard**: Interactive team overview for managers, personalized timeline for employees
- **User Management**: Complete CRUD operations for creating and managing users

### 🎯 Advanced Features Implemented

- **Proactive Feedback Requests**: Employees can request specific feedback from managers
- **Smart Tagging System**: Categorize feedback with colored tags (Communication, Leadership, etc.)
- **Acknowledgment System**: Employees can acknowledge received feedback with timestamps
- **Markdown Support**: Rich text formatting in feedback content
- **Real-time Notifications**: Toast notifications for all user actions
- **Optimistic Updates**: Instant UI feedback with error rollback
- **Advanced Filtering**: Filter feedback by sentiment, acknowledgment status, date ranges
- **Search Functionality**: Full-text search across feedback content
- **Pagination**: Efficient data loading with customizable page sizes

### 🔧 Technical Features

- **Redux State Management**: Enterprise-level state management with Redux Toolkit
- **Email Service**: Professional HTML email templates with Gmail SMTP integration
- **API Centralization**: Configurable API endpoints with environment-based URLs
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Loading States**: Granular loading indicators for better UX
- **Data Persistence**: Redux Persist for seamless session management
- **Responsive Design**: Mobile-first design with Tailwind CSS

## 🏗️ Tech Stack

### Frontend

- **React 18**: Modern React with hooks and functional components
- **Redux Toolkit**: Advanced state management with async thunks
- **React Router**: Client-side routing with protected routes
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Axios**: HTTP client with interceptors and error handling
- **React Markdown**: Markdown rendering support
- **Redux Persist**: State persistence across browser sessions

### Backend

- **FastAPI**: Modern Python web framework with automatic API documentation
- **SQLAlchemy**: Python SQL toolkit and ORM
- **Pydantic**: Data validation using Python type annotations
- **JWT Authentication**: Secure token-based authentication
- **Bcrypt**: Password hashing for security
- **SMTP Integration**: Email service with Gmail support
- **SQLite**: Lightweight, serverless database
- **Python-dotenv**: Environment variable management

### DevOps & Tools

- **Docker**: Containerization for backend deployment
- **Redux DevTools**: Time-travel debugging and state inspection
- **Environment Configuration**: Separate configs for development/production
- **Database Migrations**: Automated schema updates

## 📋 Setup Instructions

### Prerequisites

- **Python 3.9+** with pip
- **Node.js 16+** with npm
- **Docker** (optional, for containerized deployment)

### 🚀 Quick Start

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd feedback-system
   ```

2. **Environment Setup**

   ```bash
   # Backend environment
   cd backend
   cp .env.sample .env
   # Edit .env with your Gmail credentials and secret key

   # Frontend environment
   cd ../frontend
   cp .env.sample .env
   # Edit .env if needed (defaults work for development)
   ```

   📋 **See [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) for detailed configuration guide**

3. **Backend Setup**

   ```bash
   cd backend

   # Create virtual environment
   python -m venv venv

   # Activate virtual environment
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   source venv/bin/activate

   # Install dependencies
   pip install -r requirements.txt

   # Run database migration (adds email verification columns)
   python migrate_db.py

   # Start the server
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

4. **Frontend Setup** (in a new terminal)

   ```bash
   cd frontend

   # Install dependencies
   npm install

   # Start development server
   npm start
   ```

5. **Access the Application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000
   - **API Documentation**: http://localhost:8000/docs
   - **Redux DevTools**: Available in browser developer tools

### 🔐 Demo Accounts (Pre-verified)

- **Manager**: manager@company.com / password123
- **Employee 1**: employee1@company.com / password123
- **Employee 2**: employee2@company.com / password123

### 🐳 Docker Deployment

**Backend Only** (Recommended):

```bash
cd backend
docker build -t feedback-system-backend .
docker run -p 8000:8000 feedback-system-backend
```

**Full Stack** (Optional):

```bash
# Backend
docker build -t feedback-backend ./backend
docker run -d -p 8000:8000 feedback-backend

# Frontend (build for production)
cd frontend
npm run build
# Serve with your preferred static file server
```

### 🌐 Production Deployment

1. **Environment Variables**:

   ```bash
   # Backend (.env)
   SECRET_KEY=your-production-secret-key
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   DATABASE_URL=your-production-database-url

   # Frontend (.env)
   REACT_APP_API_BASE_URL=https://your-api-domain.com
   ```

2. **Database Migration**:

   ```bash
   python migrate_db.py  # Adds email verification columns
   ```

3. **Production Server**:
   ```bash
   # Use Gunicorn for production
   pip install gunicorn
   gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

## 🗄️ Database Schema

### Core Tables

- **users**: User authentication, roles, email verification status
- **feedback**: Feedback entries with manager-employee relationships
- **tags**: Categorization tags with colors
- **feedback_tags**: Many-to-many relationship for feedback categorization
- **feedback_requests**: Employee-initiated feedback requests

### Key Relationships

- Users have hierarchical manager-employee relationships
- Feedback links managers to employees with timestamps
- Tags provide flexible categorization system
- Requests enable proactive feedback solicitation

## 🏛️ Architecture Decisions

### Backend Architecture

1. **FastAPI**: Chosen for automatic API documentation, type hints, and async support
2. **SQLAlchemy ORM**: Provides database abstraction and relationship management
3. **Pydantic Schemas**: Ensures data validation and API documentation
4. **JWT Authentication**: Stateless authentication suitable for API architecture
5. **Email Service**: Modular email system with HTML templates

### Frontend Architecture

1. **Redux Toolkit**: Predictable state management with excellent DevTools
2. **Component-Based Design**: Reusable, maintainable React components
3. **Custom Hooks**: Simplified state access and business logic encapsulation
4. **API Centralization**: Single source of truth for all API endpoints
5. **Responsive Design**: Mobile-first approach with Tailwind CSS

### Security Features

1. **Role-Based Access Control**: Implemented at both API and UI levels
2. **JWT Token Management**: Secure token storage and automatic refresh
3. **Email Verification**: Prevents unauthorized account creation
4. **Password Hashing**: Bcrypt for secure password storage
5. **CORS Configuration**: Proper cross-origin resource sharing setup

## 📊 State Management

### Redux Store Structure

```javascript
{
  auth: {
    user, token, isAuthenticated, loading,
    needsVerification, verificationLoading
  },
  users: {
    users, teamMembers, managers,
    loading, createLoading, errors
  },
  feedback: {
    feedback, tags, feedbackRequests,
    loading states, error handling
  },
  dashboard: {
    stats, recent_feedback, loading
  },
  ui: {
    modals, notifications, filters,
    pagination, search, editing states
  }
}
```

### Key Redux Features

- **Async Thunks**: Proper async action handling
- **Optimistic Updates**: Instant UI feedback
- **Error Boundaries**: Comprehensive error handling
- **State Persistence**: Authentication across sessions
- **Computed Selectors**: Efficient data derivation

## 📧 Email System

### Email Templates

- **Verification Email**: Professional HTML template with secure links
- **Welcome Email**: User credentials and role-specific instructions
- **Responsive Design**: Works across all email clients

### SMTP Configuration

- **Gmail Integration**: Uses app-specific passwords
- **Environment-Based**: Configurable for different environments
- **Error Handling**: Graceful fallback when email fails

## 🧪 Testing & Development

### Development Tools

- **Redux DevTools**: Time-travel debugging and state inspection
- **Hot Reloading**: Instant feedback during development
- **Environment Variables**: Separate configs for dev/prod
- **Database Health Checks**: Automated database validation

### API Documentation

- **FastAPI Docs**: Automatic interactive API documentation
- **Schema Validation**: Request/response validation with examples
- **Error Responses**: Documented error codes and messages

## 🚀 Performance Optimizations

### Frontend Optimizations

- **Selective Re-renders**: Only affected components update
- **Memoized Selectors**: Cached expensive computations
- **Lazy Loading**: Components and data loaded on demand
- **Optimistic Updates**: Instant UI feedback

### Backend Optimizations

- **Database Indexing**: Optimized queries with proper indexes
- **Async Operations**: Non-blocking I/O operations
- **Connection Pooling**: Efficient database connections
- **Caching Headers**: Proper HTTP caching strategies

## 🔮 Future Enhancements

### Potential Features

- **Real-time Updates**: WebSocket integration for live updates
- **Advanced Analytics**: Detailed performance metrics and insights
- **File Attachments**: Support for documents and images in feedback
- **Mobile App**: React Native mobile application
- **API Rate Limiting**: Enhanced security and performance
- **Audit Logging**: Complete action history and compliance

### Technical Improvements

- **RTK Query**: Replace manual API calls with RTK Query
- **Micro-frontends**: Modular frontend architecture
- **GraphQL**: More efficient data fetching
- **Kubernetes**: Container orchestration for scaling
- **CI/CD Pipeline**: Automated testing and deployment

## 🤝 Contributing

This project demonstrates modern web development best practices including:

- **Clean Architecture**: Well-structured system design and patterns
- **Code Quality**: Maintainable and scalable code organization
- **Comprehensive Documentation**: Detailed guides and inline comments
- **Testing Strategies**: Robust error handling and edge case coverage

All code has been thoroughly reviewed, tested, and optimized for this specific use case.

## 📄 License

This project is built for educational and demonstration purposes. Feel free to use it as a reference for your own projects.

---

**Built with ❤️ using modern web technologies and best practices.**

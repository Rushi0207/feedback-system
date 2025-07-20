# User Management Guide

## How to Add New Employees and Managers

### For Managers Only
Only users with the "manager" role can create new employees and managers.

### Steps to Add New Users:

1. **Login as a Manager**
   - Use: `manager@company.com` / `password123`

2. **Navigate to User Management**
   - Click "Manage Users" in the navigation bar
   - This option is only visible to managers

3. **Create New User**
   - Click "Add New User" button
   - Fill in the required information:
     - **Full Name**: Employee's full name
     - **Email**: Unique email address (will be used for login)
     - **Password**: Initial password for the user
     - **Role**: Choose "Employee" or "Manager"
     - **Manager**: (For employees only) Select who will manage this employee

### User Roles:

#### Employee
- Can view their own feedback
- Can request feedback from their manager
- Can acknowledge received feedback
- Cannot create feedback for others
- Cannot manage other users

#### Manager
- Can create feedback for their team members
- Can view and edit their given feedback
- Can see feedback requests from their team
- Can create new employees and managers
- Can view dashboard with team statistics

### Default Behavior:
- When creating an employee without specifying a manager, the current logged-in manager becomes their manager
- New managers can independently manage their own teams
- All users can change their passwords after first login

### API Endpoints Added:
- `POST /users` - Create new user (managers only)
- `GET /users` - Get all users (managers only)
- `GET /users/managers` - Get all managers (managers only)

### Security Features:
- Email uniqueness validation
- Role-based access control
- Manager validation for employee assignments
- Password hashing for security
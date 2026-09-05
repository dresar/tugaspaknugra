# Todo List REST API

A comprehensive REST API for managing tasks (to-do list) built with Node.js, Express.js, and SQLite. This API provides complete CRUD operations for users, categories, and tasks with JWT authentication.

## Features

- ✅ **User Management**: Registration, login, and profile management
- ✅ **Task Management**: Complete CRUD operations for tasks
- ✅ **Category Management**: Organize tasks with custom categories
- ✅ **Authentication**: JWT-based authentication and authorization
- ✅ **Validation**: Comprehensive input validation using express-validator
- ✅ **Security**: Password hashing with bcrypt
- ✅ **Database**: SQLite database with proper relationships
- ✅ **Pagination**: Support for paginated task listings
- ✅ **Search & Filter**: Search tasks and filter by status, priority, category
- ✅ **Error Handling**: Proper error handling and consistent JSON responses

## Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: SQLite
- **Authentication**: JWT (JSON Web Token)
- **Validation**: express-validator
- **Security**: bcryptjs for password hashing
- **CORS**: Cross-Origin Resource Sharing support

## Project Structure

```
project-root/
├── config/
│   └── database.js          # Database configuration and connection
├── controllers/
│   ├── userController.js    # User-related operations
│   ├── taskController.js    # Task-related operations
│   └── categoryController.js # Category-related operations
├── middleware/
│   └── auth.js              # Authentication middleware
├── routes/
│   ├── userRoutes.js        # User API routes
│   ├── taskRoutes.js        # Task API routes
│   └── categoryRoutes.js    # Category API routes
├── .env.example             # Environment variables template
├── package.json             # Dependencies and scripts
├── server.js                # Main application entry point
└── README.md                # Project documentation
```

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup Steps

1. **Clone or download the project**
   ```bash
   # If you have the project files, navigate to the directory
   cd todo-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   copy .env.example .env
   
   # Edit .env file with your configuration
   ```

4. **Configure environment variables**
   Edit the `.env` file:
   ```env
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
   JWT_EXPIRES_IN=7d
   DB_PATH=./database.sqlite
   CORS_ORIGIN=http://localhost:3000
   ```

5. **Start the server**
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Verify installation**
   Open your browser and visit: `http://localhost:3000`
   
   You should see a welcome message with API documentation.

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Response Format
All API responses follow this consistent format:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Authentication
Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### 🔐 User Management

#### Register User
```http
POST /api/users/register
```
**Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "Password123"
}
```

#### Login User
```http
POST /api/users/login
```
**Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

#### Get User Profile
```http
GET /api/users/profile
```
**Headers:** `Authorization: Bearer <token>`

### 📁 Category Management

#### Get All Categories
```http
GET /api/categories
```
**Headers:** `Authorization: Bearer <token>`

#### Create Category
```http
POST /api/categories
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "name": "Work",
  "color": "#FF5733"
}
```

#### Update Category
```http
PUT /api/categories/:id
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "name": "Personal",
  "color": "#33FF57"
}
```

#### Delete Category
```http
DELETE /api/categories/:id
```
**Headers:** `Authorization: Bearer <token>`

### ✅ Task Management

#### Get All Tasks
```http
GET /api/tasks?page=1&limit=10&status=pending&priority=high&category_id=1&search=meeting
```
**Headers:** `Authorization: Bearer <token>`
**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page (max 100)
- `status` (optional): Filter by status (`pending` or `completed`)
- `priority` (optional): Filter by priority (`low`, `medium`, `high`)
- `category_id` (optional): Filter by category ID
- `search` (optional): Search in title and description

#### Get Task by ID
```http
GET /api/tasks/:id
```
**Headers:** `Authorization: Bearer <token>`

#### Create Task
```http
POST /api/tasks
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive API documentation",
  "priority": "high",
  "due_date": "2024-12-31",
  "category_id": 1
}
```

#### Update Task
```http
PUT /api/tasks/:id
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "status": "completed",
  "priority": "medium",
  "due_date": "2024-12-25",
  "category_id": 2
}
```

#### Update Task Status
```http
PATCH /api/tasks/:id/status
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "status": "completed"
}
```

#### Delete Task
```http
DELETE /api/tasks/:id
```
**Headers:** `Authorization: Bearer <token>`

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Categories Table
```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) DEFAULT '#007bff',
  user_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE,
  category_id INTEGER,
  user_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Testing with Postman

### 1. Import Environment
Create a new environment in Postman with these variables:
- `base_url`: `http://localhost:3000/api`
- `token`: (will be set after login)

### 2. Test Sequence

1. **Register a new user**
   - POST `{{base_url}}/users/register`
   - Save the token from response

2. **Login**
   - POST `{{base_url}}/users/login`
   - Copy token to environment variable

3. **Create categories**
   - POST `{{base_url}}/categories`
   - Add Authorization header: `Bearer {{token}}`

4. **Create tasks**
   - POST `{{base_url}}/tasks`
   - Add Authorization header: `Bearer {{token}}`

5. **Test other endpoints**
   - Use the token for all authenticated requests

### Sample Postman Collection

```json
{
  "info": {
    "name": "Todo API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Users",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"testuser\",\n  \"email\": \"test@example.com\",\n  \"password\": \"Password123\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/users/register",
              "host": ["{{base_url}}"],
              "path": ["users", "register"]
            }
          }
        }
      ]
    }
  ]
}
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (valid token but insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- SQL injection prevention
- CORS configuration
- Request size limits

## Development

### Available Scripts

```bash
# Start development server with auto-restart
npm run dev

# Start production server
npm start

# Install dependencies
npm install
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|----------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |
| `DB_PATH` | SQLite database path | `./database.sqlite` |
| `CORS_ORIGIN` | CORS origin | `*` |

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Change PORT in .env file or kill the process
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   ```

2. **Database connection issues**
   - Ensure the database file path is correct
   - Check file permissions

3. **JWT token issues**
   - Ensure JWT_SECRET is set in .env
   - Check token format in Authorization header

4. **Validation errors**
   - Check request body format
   - Ensure required fields are provided

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please create an issue in the repository or contact the development team.

---

**Happy coding! 🚀**
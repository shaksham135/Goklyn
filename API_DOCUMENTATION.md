# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints except `/auth/login` and `/auth/register` require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Table of Contents
1. [Authentication](#authentication-1)
2. [Testimonials](#testimonials)
3. [Projects](#projects)
4. [Users](#users)
5. [Uploads](#uploads)
6. [Analytics](#analytics)

---

## Authentication

### Register a New User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "passwordConfirm": "SecurePass123!"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "token": "jwt.token.here",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "token": "jwt.token.here",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

---

## Testimonials

### Get All Testimonials (Public)
```http
GET /testimonials
```

**Response (200 OK):**
```json
[
  {
    "_id": "60d21b4667d0d8992e610c85",
    "clientName": "Jane Smith",
    "company": "Acme Inc.",
    "feedback": "Great service!",
    "rating": 5,
    "approved": true,
    "createdAt": "2023-05-15T10:00:00.000Z"
  }
]
```

### Add New Testimonial (Protected)
```http
POST /testimonials/add
Content-Type: multipart/form-data
```

**Form Data:**
- `clientName`: String (required)
- `company`: String (required)
- `feedback`: String (required)
- `rating`: Number (1-5)

**Response (201 Created):**
```json
{
  "msg": "Testimonial added successfully!",
  "testimonial": {
    "_id": "60d21b4667d0d8992e610c85",
    "clientName": "John Doe",
    "company": "Tech Corp",
    "feedback": "Amazing work!",
    "rating": 5,
    "approved": true,
    "photo": "https://res.cloudinary.com/.../testimonial.jpg",
    "createdAt": "2023-05-15T10:00:00.000Z"
  }
}
```

---

## Projects

### Get All Projects
```http
GET /projects
```

**Response (200 OK):**
```json
[
  {
    "_id": "60d21b4667d0d8992e610c86",
    "title": "E-commerce Website",
    "description": "A full-featured online store",
    "technologies": ["React", "Node.js", "MongoDB"],
    "imageUrl": "https://res.cloudinary.com/.../project.jpg",
    "demoUrl": "https://example.com",
    "githubUrl": "https://github.com/...",
    "createdAt": "2023-05-10T08:30:00.000Z"
  }
]
```

### Create New Project (Admin/Sub-Admin)
```http
POST /projects
Content-Type: multipart/form-data
```

**Form Data:**
- `title`: String (required)
- `description`: String (required)
- `technologies`: String (comma-separated)
- `demoUrl`: String (URL)
- `githubUrl`: String (URL)
- `photo`: Image file (required)

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "_id": "60d21b4667d0d8992e610c86",
    "title": "New Project",
    "description": "Project description",
    "technologies": ["React", "Node.js"],
    "imageUrl": "https://res.cloudinary.com/.../project.jpg",
    "createdAt": "2023-05-15T10:00:00.000Z"
  }
}
```

---

## Users

### Get Current User Profile
```http
GET /users/me
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "user",
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

---

## Uploads

### Upload File
```http
POST /upload
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: File to upload

**Response (200 OK):**
```json
{
  "success": true,
  "fileUrl": "https://res.cloudinary.com/.../filename.jpg"
}
```

---

## Analytics

### Get Dashboard Stats (Admin)
```http
GET /analytics/dashboard
```

**Response (200 OK):**
```json
{
  "totalUsers": 150,
  "totalProjects": 45,
  "totalTestimonials": 28,
  "recentActivities": [
    {
      "type": "login",
      "user": "john_doe",
      "timestamp": "2023-05-15T09:30:00.000Z"
    }
  ]
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Server error",
  "error": "Error details in development mode"
}
```

## Rate Limiting
- All authentication endpoints: 100 requests per 15 minutes
- Other endpoints: 1000 requests per hour

## Response Headers
- `X-RateLimit-Limit`: Request limit per window
- `X-RateLimit-Remaining`: Remaining requests in the current window
- `X-RateLimit-Reset`: Time when the rate limit resets (Unix timestamp)

# User Authentication API Documentation

This document provides detailed information about the user authentication API endpoints, including how to register a new user, log in, and manage user sessions.

## Base URL
```
http://localhost:5000/api/auth
```

## Table of Contents
1. [Register a New User](#register-a-new-user)
2. [User Login](#user-login)
3. [Get Current User](#get-current-user)
4. [Logout](#logout)
5. [Forgot Password](#forgot-password)
6. [Reset Password](#reset-password)

---

## Register a New User
Register a new user account.

### Endpoint
```
POST /register
```

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| username | String | Yes | Unique username (3-30 chars) |
| email | String | Yes | Valid email address |
| password | String | Yes | Password (min 8 chars) |
| passwordConfirm | String | Yes | Must match password |
| role | String | No | Either 'admin' or 'sub-admin' (default: 'sub-admin') |

### Example Request (cURL)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123!",
    "passwordConfirm": "SecurePass123!"
  }'
```

### Example Request (Postman)
1. Set request method to `POST`
2. Set URL to `http://localhost:5000/api/auth/register`
3. Go to `Body` > `raw` > Select `JSON`
4. Enter the request body:
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "SecurePass123!",
  "passwordConfirm": "SecurePass123!"
}
```

### Success Response (201 Created)
```json
{
  "status": "success",
  "token": "jwt.token.here",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "testuser",
      "email": "test@example.com",
      "role": "sub-admin",
      "isActive": true,
      "createdAt": "2025-07-03T14:15:22Z"
    }
  }
}
```

### Error Responses
- **400 Bad Request**: Missing required fields or validation errors
- **409 Conflict**: Email or username already exists
- **500 Internal Server Error**: Server error

---

## User Login
Authenticate a user and receive a JWT token.

### Endpoint
```
POST /login
```

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | String | Yes | User's email |
| password | String | Yes | User's password |

### Example Request (cURL)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

### Success Response (200 OK)
```json
{
  "status": "success",
  "token": "jwt.token.here",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "testuser",
      "email": "test@example.com",
      "role": "sub-admin"
    }
  }
}
```

---

## Get Current User
Get the currently authenticated user's information.

### Endpoint
```
GET /me
```

### Headers
```
Authorization: Bearer <jwt_token>
```

### Example Request (cURL)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer your.jwt.token.here"
```

---

## Logout
Log out the current user (clears the JWT cookie).

### Endpoint
```
POST /logout
```

### Headers
```
Authorization: Bearer <jwt_token>
```

---

## Forgot Password
Request a password reset email.

### Endpoint
```
POST /forgot-password
```

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | String | Yes | User's email address |

---

## Reset Password
Reset user's password using a token from email.

### Endpoint
```
PATCH /reset-password/:token
```

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| password | String | Yes | New password |
| passwordConfirm | String | Yes | Must match new password |

## Authentication Flow
1. Register a new user using `/register`
2. Log in using `/login` to get a JWT token
3. Use the token in the `Authorization` header for protected routes
4. The token is valid for the duration specified in `JWT_EXPIRE` (default: 30d)

## Security Notes
- Always use HTTPS in production
- Store JWT securely (HTTP-only cookies recommended)
- Implement rate limiting on authentication endpoints
- Use strong password policies
- Keep your JWT secret secure and never commit it to version control

# Environment Configuration Guide

This guide explains how to set up environment variables for both the frontend and backend of the application.

## Table of Contents
1. [Quick Start](#quick-start)
2. [Backend Variables](#backend-environment-variables)
3. [Frontend Variables](#frontend-environment-variables)
4. [Security Best Practices](#security-best-practices)
5. [Deployment Notes](#deployment-notes)

## Quick Start

1. Copy the example file to create your `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Update the values in `.env` with your actual configuration.

3. For production, create a separate `.env.production` file with production-specific values.

## Backend Environment Variables

### Server Configuration
- `NODE_ENV`: Application environment (`development`, `production`, `test`)
- `PORT`: Port the server will run on (default: `5000`)

### Database
- `MONGODB_URI`: MongoDB connection string (development)
- `MONGODB_URI_PROD`: MongoDB connection string (production)

### Authentication
- `JWT_SECRET`: Secret key for JWT token signing
- `JWT_EXPIRE`: JWT expiration time (e.g., `30d` for 30 days)
- `JWT_COOKIE_EXPIRE`: Cookie expiration in days
- `JWT_RESET_EXPIRE`: Password reset token expiration (e.g., `10m` for 10 minutes)

### Email (for password reset)
- `EMAIL_HOST`: SMTP server host
- `EMAIL_PORT`: SMTP server port
- `EMAIL_USER`: SMTP username
- `EMAIL_PASSWORD`: SMTP password
- `EMAIL_FROM`: Sender email address

### File Uploads (Cloudinary)
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret

### Security
- `FRONTEND_URL`: Allowed frontend origin for CORS
- `RATE_LIMIT_WINDOW_MS`: Rate limiting window in milliseconds
- `RATE_LIMIT_MAX`: Maximum requests per window
- `XSS_ENABLED`: Enable XSS protection
- `HPP_ENABLED`: Enable HTTP Parameter Pollution protection
- `CONTENT_SECURITY_POLICY_ENABLED`: Enable Content Security Policy

## Frontend Environment Variables

All frontend variables must be prefixed with `REACT_APP_` to be accessible in the React application.

### API Configuration
- `REACT_APP_API_URL`: Base URL for API requests (e.g., `http://localhost:5000/api`)
- `REACT_APP_GOOGLE_ANALYTICS_ID`: Google Analytics tracking ID (optional)

### Feature Flags
- `REACT_APP_ENABLE_ANALYTICS`: Enable/disable analytics features
- `REACT_APP_ENABLE_MAINTENANCE_MODE`: Show maintenance page when enabled

## Security Best Practices

1. **Never commit sensitive data**
   - Ensure `.env` is in your `.gitignore` file
   - Only commit `.env.example` with placeholder values

2. **Use strong secrets**
   - Generate strong, random values for all secrets
   - Use a password manager to store them securely

3. **Environment separation**
   - Use different values for development, staging, and production
   - Never use production credentials in development

4. **Access control**
   - Restrict access to production environment variables
   - Use the principle of least privilege for database users

## Deployment Notes

### Heroku
```bash
# Set config vars
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_production_mongodb_uri
# ... set other variables

# Or upload .env file
heroku config:push
```

### Docker
```dockerfile
# In your Dockerfile
ENV NODE_ENV=production
ENV PORT=5000
# ... other variables

# Or use --env-file flag
docker run --env-file .env your-image
```

### Vercel/Netlify
- Set environment variables in the project settings
- Prefix frontend variables with `REACT_APP_`
- For serverless functions, set the variables in the deployment configuration

## Troubleshooting

- If environment variables aren't being loaded:
  - Ensure the `.env` file is in the root directory
  - Restart your development server after changing variables
  - Check for typos in variable names
  - Ensure proper syntax (no spaces around `=`)

- For frontend variables:
  - Variables must be prefixed with `REACT_APP_`
  - Changes require a rebuild of the React app

# Deployment Guide

## Prerequisites
- Server with Node.js and MongoDB installed
- Domain name (for production)
- SSL certificate (recommended)

## Backend Deployment

### 1. Environment Setup
```bash
# Install PM2 process manager
npm install -g pm2

# Set environment variables
cp .env.example .env
# Edit .env with production values
```

### 2. Start Backend Service
```bash
# Install dependencies
cd backend
npm install --production

# Start the service
pm2 start server.js --name "goklyn-backend"

# Enable auto-start on server reboot
pm2 startup
pm2 save
```

## Frontend Deployment

### 1. Build the Application
```bash
# Install dependencies
npm install

# Create production build
npm run build
```

### 2. Serve with Nginx
Example Nginx configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        root /path/to/your/app/build;
        try_files $uri /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Environment Variables
Create `.env` files with the following structure:

### Backend (.env)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/goklyn_prod
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRE=30d
FRONTEND_URL=https://yourdomain.com
# Add other required variables from .env.example
```

### Frontend (.env.production)
```env
REACT_APP_API_URL=https://api.yourdomain.com
# Add other required variables from .env.example
```

## Monitoring
```bash
# Check application logs
pm2 logs goklyn-backend

# Monitor application
pm2 monit
```

## Backup Strategy
1. **Database**: Set up MongoDB backup
   ```bash
   # Example backup command
   mongodump --db goklyn_prod --out /backup/mongodb/
   ```

2. **Application**: Keep regular backups of:
   - Environment files
   - SSL certificates
   - Uploaded files (if any)

## Security Considerations
- Use HTTPS
- Set proper file permissions
- Keep dependencies updated
- Use environment variables for secrets
- Implement rate limiting
- Set up proper CORS policies

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });
const { FilterXSS } = require('xss');
const xss = new FilterXSS({
  whiteList: {}, // empty, means filter out all tags
  stripIgnoreTag: true, // filter out all HTML not in the whitelist
  stripIgnoreTagBody: ['script'] // the script tag is a special case, we need to filter out its content
});

// Custom MongoDB sanitization middleware
const sanitizeMongo = (req, res, next) => {
  // Skip if no body or query
  if (!req.body && !req.query) return next();

  // Sanitize request body
  if (req.body) {
    const sanitize = (data) => {
      if (data && typeof data === 'object') {
        Object.keys(data).forEach(key => {
          // Remove $ and . from keys
          if (key.startsWith('$') || key.includes('.')) {
            delete data[key];
          } else if (data[key] && typeof data[key] === 'object') {
            sanitize(data[key]);
          }
        });
      }
      return data;
    };

    req.body = sanitize(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    const sanitizedQuery = {};
    Object.keys(req.query).forEach(key => {
      if (!key.startsWith('$') && !key.includes('.')) {
        sanitizedQuery[key] = req.query[key];
      }
    });
    req.query = sanitizedQuery;
  }

  next();
};
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const hpp = require('hpp');
const { handleError } = require('./utils/appError');
const { setSecurityHeaders } = require('./middleware/auth');

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

// Debug log environment variables
console.log('Environment Variables:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? '***' : 'MISSING',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? '***' : 'MISSING',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? '***' : 'MISSING'
});

const app = express();
const port = process.env.PORT || 5000;
console.log('Server will start on port:', port);
console.log('NODE_ENV:', process.env.NODE_ENV);

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',  // Main app
  'http://localhost:3001'   // Admin panel
];

const corsOptions = {
  // Allow requests from both main app and admin panel
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified origin: ${origin}`;
      console.error(msg);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
  exposedHeaders: ['Content-Range', 'X-Total-Count'] // Expose custom headers if needed
};

// Middleware

// Set security headers
app.use(helmet());
app.use(setSecurityHeaders);

// Enable CORS
app.use(cors(corsOptions));

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb', strict: false }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Cookie parser
app.use(cookieParser());

// XSS Protection Middleware
app.use((req, res, next) => {
  // Sanitize request body
  if (req.body) {
    // Create a deep copy of the body to avoid modifying the original
    const sanitizeObject = (obj) => {
      if (!obj) return obj;
      
      if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
      } else if (typeof obj === 'object') {
        const sanitized = {};
        Object.keys(obj).forEach(key => {
          sanitized[key] = sanitizeObject(obj[key]);
        });
        return sanitized;
      } else if (typeof obj === 'string') {
        return xss.process(obj);
      }
      return obj;
    };
    
    req.body = sanitizeObject(req.body);
  }
  next();
});

// Custom NoSQL injection protection
app.use(sanitizeMongo);

// Prevent parameter pollution (must be after body parsers)
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// Rate limiting for API routes
const apiLimiter = rateLimit({
  max: 100, // Limit each IP to 100 requests per windowMs
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Add request time to the request object
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Request logging middleware - Moved after body parser
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    if (req.body && typeof req.body === 'object' && Object.keys(req.body).length > 0) {
        console.log('Request body:', JSON.stringify(req.body, null, 2));
    }
    next();
});

// Test route
app.get('/api', (req, res) => {
    res.json({ message: 'API is working!' });
});



// MongoDB Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/portfolioDB';

let server;

mongoose.connect(mongoURI).then(() => {
  console.log('MongoDB database connection established successfully');
  
  // Start the server only after MongoDB connection is established
  server = app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Activity logging middleware
const { createActivity } = require('./controllers/activityController');

const activityLogger = (req, res, next) => {
  // Skip logging for GET requests and static files
  if (req.method === 'GET' || req.path.includes('.')) {
    return next();
  }

  // Store the original send function
  const originalSend = res.send;
  
  // Override the send function to log after the response is sent
  res.send = async function (body) {
    try {
      // Skip if there was an error
      if (res.statusCode >= 400) return originalSend.call(this, body);

      let entityType = '';
      let entityId = '';
      let activityType = '';
      let title = '';
      let description = '';

      // Determine activity type based on route and method
      const pathParts = req.path.split('/').filter(Boolean);
      const apiIndex = pathParts.findIndex(part => part === 'api');
      
      if (apiIndex !== -1 && pathParts.length > apiIndex + 1) {
        entityType = pathParts[apiIndex + 1];
        
        // Get entity ID from URL if available
        if (pathParts.length > apiIndex + 2) {
          entityId = pathParts[apiIndex + 2];
        }

        // Determine activity type based on HTTP method
        switch (req.method) {
          case 'POST':
            activityType = `${entityType}_create`;
            title = `New ${entityType} created`;
            description = `A new ${entityType} was created`;
            break;
          case 'PUT':
          case 'PATCH':
            activityType = `${entityType}_update`;
            title = `${entityType} updated`;
            description = `An existing ${entityType} was updated`;
            break;
          case 'DELETE':
            activityType = `${entityType}_delete`;
            title = `${entityType} deleted`;
            description = `A ${entityType} was deleted`;
            break;
        }

        // Special cases
        if (entityType === 'auth') {
          if (pathParts.includes('login')) {
            activityType = 'login';
            title = 'User logged in';
            description = 'A user logged in to the system';
          } else if (pathParts.includes('register')) {
            activityType = 'register';
            title = 'New user registered';
            description = 'A new user registered in the system';
          } else if (pathParts.includes('logout')) {
            activityType = 'logout';
            title = 'User logged out';
            description = 'A user logged out of the system';
          }
        }

        // Create activity log if we have enough information
        if (activityType && req.user) {
          await createActivity(
            req,
            activityType,
            entityType,
            entityId || req.params.id,
            title,
            description,
            { method: req.method, path: req.path }
          );
        }
      }
    } catch (error) {
      console.error('Error logging activity:', error);
    } finally {
      // Call the original send function
      return originalSend.call(this, body);
    }
  };

  next();
};

// Apply activity logging middleware
app.use(activityLogger);

// API Routes
const authRouter = require('./routes/auth');
const projectsRouter = require('./routes/projects');
const testimonialsRouter = require('./routes/testimonials');
const internshipsRouter = require('./routes/internships');
const applicationsRouter = require('./routes/applications');
const uploadRouter = require('./routes/upload');
const contactRouter = require('./routes/contact');
const analyticsRouter = require('./routes/analytics');
const eventsRouter = require('./routes/events');
const activityRouter = require('./routes/activityRoutes');

// Mount routers
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/testimonials', testimonialsRouter);
app.use('/api/internships', internshipsRouter);
app.use('/api/applications', applicationsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/contact', contactRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/activities', activityRouter);

// Error handling middleware (must be after all other middleware and routes)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Default error status and message
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  // Send error response
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    errors: err.errors || undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

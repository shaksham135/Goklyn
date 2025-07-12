# Project Handover Document

## Project Overview
- **Project Name**: Goklyn Admin Dashboard
- **Type**: Full-stack Admin Dashboard
- **Tech Stack**:
  - Frontend: React, Material-UI, Framer Motion
  - Backend: Node.js, Express, MongoDB
  - Authentication: JWT with HTTP-only cookies

## System Requirements
- Node.js v16+
- MongoDB v5+
- npm or yarn

## Setup Instructions

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your configuration
npm run dev
```

### Frontend Setup
```bash
cd ..
npm install
cp .env.example .env
# Update .env with your configuration
npm start
```

## Key Features
1. **User Authentication**
   - JWT-based authentication
   - Role-based access control (Admin/Sub-admin)
   - Password reset flow

2. **Core Modules**
   - Testimonials Management
   - Projects Management
   - User Management
   - Analytics Dashboard

## API Documentation
See [AUTH_API_DOCS.md](AUTH_API_DOCS.md) for detailed API documentation.

## Environment Configuration
See [ENV_SETUP.md](ENV_SETUP.md) for environment variable configuration.

## Development Workflow
- Main branch: `main`
- Create feature branches from `main`
- Open PRs for code review
- Use `npm test` to run tests

## Common Scripts
```bash
# Start development servers
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Lint code
npm run lint
```

## Known Issues
1. Testimonials pagination not implemented
2. Some components need TypeScript migration
3. Test coverage needs improvement

## Important Files & Directories
```
├── src/
│   ├── components/     # Reusable components
│   ├── pages/         # Page components
│   ├── contexts/      # React contexts
│   ├── hooks/         # Custom hooks
│   └── utils/         # Utility functions
├── backend/
│   ├── controllers/   # Route controllers
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   └── utils/         # Backend utilities
├── public/            # Static files
└── docs/              # Documentation
```

## Deployment
See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment instructions.

## Contact
For any questions, please contact: [Your Contact Information]

## Handover Checklist
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Credentials rotated
- [ ] Access granted to repositories
- [ ] Deployment process documented
- [ ] Knowledge transfer session completed

# User Management Service

A comprehensive microservice for user management, roles, and permissions in the Presidential Digs CRM system.

## Features

- **User Management**: Complete CRUD operations for users
- **Role Management**: Create, update, and manage user roles
- **Permission System**: Granular permission management
- **Organizational Structure**: Support for organizations and departments
- **Authentication Integration**: Works with the auth-service
- **API Documentation**: Swagger/OpenAPI documentation
- **Validation**: Comprehensive input validation
- **Security**: Password hashing, rate limiting, CORS

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB
- Redis (optional, for caching)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Update environment variables
# Edit .env with your configuration

# Start development server
npm run dev
```

### Environment Variables

See `env.example` for all available configuration options.

### API Documentation

Once running, visit `http://localhost:3005/api/docs` for interactive API documentation.

## API Endpoints

### Users
- `GET /api/v1/users` - List users with filtering and pagination
- `POST /api/v1/users` - Create a new user
- `GET /api/v1/users/:id` - Get user by ID
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user
- `PATCH /api/v1/users/:id/roles` - Update user roles
- `PATCH /api/v1/users/:id/password` - Update user password
- `PATCH /api/v1/users/:id/activate` - Activate user
- `PATCH /api/v1/users/:id/deactivate` - Deactivate user

### Roles
- `GET /api/v1/roles` - List roles
- `POST /api/v1/roles` - Create a new role
- `GET /api/v1/roles/:id` - Get role by ID
- `PATCH /api/v1/roles/:id` - Update role
- `DELETE /api/v1/roles/:id` - Delete role
- `PATCH /api/v1/roles/:id/permissions` - Update role permissions
- `POST /api/v1/roles/seed` - Seed default roles

### Permissions
- `GET /api/v1/permissions` - List permissions
- `POST /api/v1/permissions` - Create a new permission
- `GET /api/v1/permissions/:id` - Get permission by ID
- `PATCH /api/v1/permissions/:id` - Update permission
- `DELETE /api/v1/permissions/:id` - Delete permission

### Organizations
- `GET /api/v1/organizations` - List organizations
- `POST /api/v1/organizations` - Create a new organization
- `GET /api/v1/organizations/:id` - Get organization by ID
- `PATCH /api/v1/organizations/:id` - Update organization
- `DELETE /api/v1/organizations/:id` - Delete organization

## Data Models

### User
- Basic user information (name, email, phone, etc.)
- Role assignments
- Organization and department associations
- Authentication status and preferences
- Metadata and audit fields

### Role
- Role name and description
- Permission assignments
- Organization scope
- System vs custom roles
- Active/inactive status

### Permission
- Permission name and description
- Resource and action
- Active status
- Metadata

### Organization
- Organization name and details
- Hierarchical structure
- User associations
- Active status

## Security

- Password hashing with bcrypt
- JWT token validation
- Rate limiting
- CORS protection
- Input validation and sanitization
- Role-based access control

## Development

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Build for production
npm run build

# Start production server
npm start
```

## Integration

This service integrates with:
- **Auth Service**: For authentication and authorization
- **Frontend**: Via REST API endpoints
- **Other Services**: Through shared data models

## License

MIT

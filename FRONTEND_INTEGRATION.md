# Frontend Integration Guide

This guide explains how to integrate the User Management Service with the AI-CRM frontend.

## Service Overview

The User Management Service provides comprehensive APIs for:
- User CRUD operations
- Role management
- Permission handling
- Organizational structure
- User statistics and analytics

## Base URL

```
http://localhost:3005/api/v1
```

## Authentication

All endpoints require authentication via JWT token in the Authorization header:

```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

## Key Endpoints

### Users

#### Get All Users (with filtering)
```typescript
GET /users?search=john&role=agent&page=1&limit=10&isActive=true
```

Response:
```typescript
{
  users: UserResponseDto[],
  total: number,
  page: number,
  limit: number
}
```

#### Create User
```typescript
POST /users
{
  email: "john.doe@presidentialdigs.com",
  firstName: "John",
  lastName: "Doe",
  password: "SecurePassword123!",
  roles: ["agent"],
  organizationId: "64a1b2c3d4e5f6789012345"
}
```

#### Update User
```typescript
PATCH /users/:id
{
  firstName: "John",
  lastName: "Smith",
  title: "Senior Agent"
}
```

#### Update User Roles
```typescript
PATCH /users/:id/roles
{
  roles: ["agent", "manager"]
}
```

#### Activate/Deactivate User
```typescript
PATCH /users/:id/activate
PATCH /users/:id/deactivate
```

### Roles

#### Get All Roles
```typescript
GET /roles?organizationId=64a1b2c3d4e5f6789012345
```

#### Create Role
```typescript
POST /roles
{
  name: "Sales Manager",
  description: "Manages sales team and processes",
  permissions: ["leads:read", "leads:write", "users:read"],
  organizationId: "64a1b2c3d4e5f6789012345"
}
```

#### Update Role Permissions
```typescript
PATCH /roles/:id/permissions
{
  permissions: ["leads:read", "leads:write", "leads:delete", "users:read"]
}
```

## Frontend Service Integration

### Update settingsService.ts

Replace the existing user management methods in your `settingsService.ts`:

```typescript
// src/frontend/services/settingsService.ts

const USER_MANAGEMENT_SERVICE_URL = process.env.NEXT_PUBLIC_USER_MANAGEMENT_SERVICE_URL || 'http://localhost:3005/api/v1';

class SettingsService {
  // User Management
  async getUsers(params: {
    search?: string;
    role?: string;
    roles?: string[];
    department?: string;
    organizationId?: string;
    isActive?: boolean;
    isEmailVerified?: boolean;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    includeInactive?: boolean;
  } = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => queryParams.append(key, item));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });

    const response = await fetch(`${USER_MANAGEMENT_SERVICE_URL}/users?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    return response.json();
  }

  async createUser(userData: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    roles?: string[];
    organizationId?: string;
    departmentId?: string;
    title?: string;
    department?: string;
    phone?: string;
    avatar?: string;
    isActive?: boolean;
    preferences?: Record<string, any>;
    metadata?: Record<string, any>;
  }) {
    const response = await fetch(`${USER_MANAGEMENT_SERVICE_URL}/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to create user: ${response.statusText}`);
    }

    return response.json();
  }

  async updateUser(userId: string, userData: Partial<{
    email: string;
    firstName: string;
    lastName: string;
    title?: string;
    department?: string;
    phone?: string;
    avatar?: string;
    organizationId?: string;
    departmentId?: string;
    isActive?: boolean;
    preferences?: Record<string, any>;
    metadata?: Record<string, any>;
  }>) {
    const response = await fetch(`${USER_MANAGEMENT_SERVICE_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to update user: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteUser(userId: string) {
    const response = await fetch(`${USER_MANAGEMENT_SERVICE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.statusText}`);
    }
  }

  async updateUserRoles(userId: string, roles: string[]) {
    const response = await fetch(`${USER_MANAGEMENT_SERVICE_URL}/users/${userId}/roles`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roles }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to update user roles: ${response.statusText}`);
    }

    return response.json();
  }

  async activateUser(userId: string) {
    const response = await fetch(`${USER_MANAGEMENT_SERVICE_URL}/users/${userId}/activate`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to activate user: ${response.statusText}`);
    }

    return response.json();
  }

  async deactivateUser(userId: string) {
    const response = await fetch(`${USER_MANAGEMENT_SERVICE_URL}/users/${userId}/deactivate`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to deactivate user: ${response.statusText}`);
    }

    return response.json();
  }

  async getUserStats() {
    const response = await fetch(`${USER_MANAGEMENT_SERVICE_URL}/users/stats`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user stats: ${response.statusText}`);
    }

    return response.json();
  }

  // Role Management
  async getRoles(organizationId?: string) {
    const url = organizationId 
      ? `${USER_MANAGEMENT_SERVICE_URL}/roles?organizationId=${organizationId}`
      : `${USER_MANAGEMENT_SERVICE_URL}/roles`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch roles: ${response.statusText}`);
    }

    return response.json();
  }

  async createRole(roleData: {
    name: string;
    description: string;
    permissions: string[];
    organizationId?: string;
    isActive?: boolean;
    metadata?: Record<string, any>;
  }) {
    const response = await fetch(`${USER_MANAGEMENT_SERVICE_URL}/roles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(roleData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to create role: ${response.statusText}`);
    }

    return response.json();
  }

  async updateRole(roleId: string, roleData: Partial<{
    name: string;
    description: string;
    permissions: string[];
    isActive: boolean;
    metadata: Record<string, any>;
  }>) {
    const response = await fetch(`${USER_MANAGEMENT_SERVICE_URL}/roles/${roleId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(roleData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to update role: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteRole(roleId: string) {
    const response = await fetch(`${USER_MANAGEMENT_SERVICE_URL}/roles/${roleId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete role: ${response.statusText}`);
    }
  }

  async updateRolePermissions(roleId: string, permissions: string[]) {
    const response = await fetch(`${USER_MANAGEMENT_SERVICE_URL}/roles/${roleId}/permissions`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ permissions }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `Failed to update role permissions: ${response.statusText}`);
    }

    return response.json();
  }

  async getRoleStats() {
    const response = await fetch(`${USER_MANAGEMENT_SERVICE_URL}/roles/stats`, {
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch role stats: ${response.statusText}`);
    }

    return response.json();
  }

  private getAuthToken(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token') || '';
    }
    return '';
  }
}

export const settingsService = new SettingsService();
```

## Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_USER_MANAGEMENT_SERVICE_URL=http://localhost:3005/api/v1
```

## Error Handling

The service returns detailed error messages. Handle them appropriately:

```typescript
try {
  const user = await settingsService.createUser(userData);
  // Handle success
} catch (error) {
  if (error.message.includes('already exists')) {
    // Handle duplicate email
  } else if (error.message.includes('validation')) {
    // Handle validation errors
  } else {
    // Handle other errors
  }
}
```

## Testing

1. Start the User Management Service:
   ```bash
   cd user-management-service
   ./start.sh
   ```

2. Test the API:
   ```bash
   curl http://localhost:3005/api/docs
   ```

3. Test with authentication:
   ```bash
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
        http://localhost:3005/api/v1/users
   ```

## Next Steps

1. Update your frontend components to use the new service methods
2. Add proper error handling and loading states
3. Implement real-time updates if needed
4. Add user management to your admin dashboard
5. Test thoroughly with different user roles and permissions

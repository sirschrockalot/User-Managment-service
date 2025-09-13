import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty({ description: 'User ID', example: '64a1b2c3d4e5f6789012345' })
  @Expose()
  _id: string;

  @ApiProperty({ description: 'User email address', example: 'john.doe@presidentialdigs.com' })
  @Expose()
  email: string;

  @ApiProperty({ description: 'User first name', example: 'John' })
  @Expose()
  firstName: string;

  @ApiProperty({ description: 'User last name', example: 'Doe' })
  @Expose()
  lastName: string;

  @ApiPropertyOptional({ description: 'User phone number', example: '+1-555-123-4567' })
  @Expose()
  phone?: string;

  @ApiPropertyOptional({ description: 'User job title', example: 'Sales Manager' })
  @Expose()
  title?: string;

  @ApiPropertyOptional({ description: 'User department', example: 'Sales' })
  @Expose()
  department?: string;

  @ApiPropertyOptional({ description: 'User avatar URL', example: 'https://example.com/avatar.jpg' })
  @Expose()
  avatar?: string;

  @ApiProperty({ description: 'User roles', example: ['agent', 'manager'] })
  @Expose()
  roles: string[];

  @ApiPropertyOptional({ description: 'Organization ID', example: '64a1b2c3d4e5f6789012345' })
  @Expose()
  organizationId?: string;

  @ApiPropertyOptional({ description: 'Department ID', example: '64a1b2c3d4e5f6789012346' })
  @Expose()
  departmentId?: string;

  @ApiProperty({ description: 'Whether user is active', example: true })
  @Expose()
  isActive: boolean;

  @ApiProperty({ description: 'Whether email is verified', example: true })
  @Expose()
  isEmailVerified: boolean;

  @ApiProperty({ description: 'Whether MFA is enabled', example: false })
  @Expose()
  isMfaEnabled: boolean;

  @ApiPropertyOptional({ description: 'Last login date', example: '2024-01-20T10:30:00Z' })
  @Expose()
  lastLoginAt?: Date;

  @ApiPropertyOptional({ description: 'Password changed date', example: '2024-01-15T14:20:00Z' })
  @Expose()
  passwordChangedAt?: Date;

  @ApiPropertyOptional({ description: 'User preferences', example: { theme: 'dark', language: 'en' } })
  @Expose()
  preferences: Record<string, any>;

  @ApiPropertyOptional({ description: 'User metadata', example: { source: 'import', notes: 'Imported from HR system' } })
  @Expose()
  metadata: Record<string, any>;

  @ApiProperty({ description: 'User creation date', example: '2024-01-01T00:00:00Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'User last update date', example: '2024-01-20T10:30:00Z' })
  @Expose()
  updatedAt: Date;

  // Exclude sensitive fields
  @Exclude()
  password: string;

  @Exclude()
  mfaSecret?: string;

  @Exclude()
  backupCodes: string[];

  @Exclude()
  loginHistory: string[];

  // Computed fields
  @ApiProperty({ description: 'User full name', example: 'John Doe' })
  @Expose()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @ApiProperty({ description: 'User initials', example: 'JD' })
  @Expose()
  get initials(): string {
    return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase();
  }
}

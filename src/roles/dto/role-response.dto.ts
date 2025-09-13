import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class RoleResponseDto {
  @ApiProperty({ description: 'Role ID', example: '64a1b2c3d4e5f6789012345' })
  @Expose()
  _id: string;

  @ApiProperty({ description: 'Role name', example: 'Sales Manager' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'Role description', example: 'Manages sales team and processes' })
  @Expose()
  description: string;

  @ApiProperty({ description: 'Role permissions', example: ['leads:read', 'leads:write', 'users:read'] })
  @Expose()
  permissions: string[];

  @ApiProperty({ description: 'Whether role is system role', example: false })
  @Expose()
  isSystem: boolean;

  @ApiProperty({ description: 'Whether role is active', example: true })
  @Expose()
  isActive: boolean;

  @ApiPropertyOptional({ description: 'Organization ID', example: '64a1b2c3d4e5f6789012345' })
  @Expose()
  organizationId?: string;

  @ApiPropertyOptional({ description: 'Role metadata', example: { category: 'management', level: 'senior' } })
  @Expose()
  metadata: Record<string, any>;

  @ApiProperty({ description: 'Role creation date', example: '2024-01-01T00:00:00Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Role last update date', example: '2024-01-20T10:30:00Z' })
  @Expose()
  updatedAt: Date;

  @ApiProperty({ description: 'Number of users with this role', example: 5 })
  @Expose()
  @Transform(({ obj }) => obj.userCount || 0)
  userCount: number;
}

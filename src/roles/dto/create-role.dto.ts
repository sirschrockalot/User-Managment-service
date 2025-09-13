import { IsString, IsOptional, IsBoolean, IsArray, IsObject, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ description: 'Role name', example: 'Sales Manager' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name must not exceed 50 characters' })
  name: string;

  @ApiProperty({ description: 'Role description', example: 'Manages sales team and processes' })
  @IsString({ message: 'Description must be a string' })
  @MinLength(10, { message: 'Description must be at least 10 characters long' })
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description: string;

  @ApiProperty({ description: 'Role permissions', example: ['leads:read', 'leads:write', 'users:read'] })
  @IsArray({ message: 'Permissions must be an array' })
  @IsString({ each: true, message: 'Each permission must be a string' })
  permissions: string[];

  @ApiPropertyOptional({ description: 'Whether role is active', example: true })
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Organization ID', example: '64a1b2c3d4e5f6789012345' })
  @IsOptional()
  @IsString({ message: 'Organization ID must be a string' })
  organizationId?: string;

  @ApiPropertyOptional({ description: 'Role metadata', example: { category: 'management', level: 'senior' } })
  @IsOptional()
  @IsObject({ message: 'Metadata must be an object' })
  metadata?: Record<string, any>;
}

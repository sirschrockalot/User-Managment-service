import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleResponseDto } from './dto/role-response.dto';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new role' })
  @ApiResponse({ status: 201, description: 'Role created successfully', type: RoleResponseDto })
  @ApiResponse({ status: 409, description: 'Role with this name already exists' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(@Body() createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all roles' })
  @ApiResponse({ status: 200, description: 'Roles retrieved successfully', type: [RoleResponseDto] })
  @ApiQuery({ name: 'organizationId', required: false, description: 'Filter by organization ID' })
  async findAll(@Query('organizationId') organizationId?: string): Promise<RoleResponseDto[]> {
    return this.rolesService.findAll(organizationId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get role statistics' })
  @ApiResponse({ status: 200, description: 'Role statistics retrieved successfully' })
  async getStats() {
    return this.rolesService.getRolesStats();
  }

  @Get('system')
  @ApiOperation({ summary: 'Get system roles' })
  @ApiResponse({ status: 200, description: 'System roles retrieved successfully', type: [RoleResponseDto] })
  async getSystemRoles(): Promise<RoleResponseDto[]> {
    return this.rolesService.getSystemRoles();
  }

  @Get('organization/:organizationId')
  @ApiOperation({ summary: 'Get roles by organization' })
  @ApiParam({ name: 'organizationId', description: 'Organization ID' })
  @ApiResponse({ status: 200, description: 'Roles retrieved successfully', type: [RoleResponseDto] })
  async getRolesByOrganization(@Param('organizationId') organizationId: string): Promise<RoleResponseDto[]> {
    return this.rolesService.getRolesByOrganization(organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Role retrieved successfully', type: RoleResponseDto })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async findOne(@Param('id') id: string): Promise<RoleResponseDto> {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update role' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Role updated successfully', type: RoleResponseDto })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 409, description: 'Role with this name already exists' })
  @ApiResponse({ status: 400, description: 'Cannot modify system roles' })
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto): Promise<RoleResponseDto> {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Patch(':id/permissions')
  @ApiOperation({ summary: 'Update role permissions' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Role permissions updated successfully', type: RoleResponseDto })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 400, description: 'Cannot modify system roles' })
  async updatePermissions(
    @Param('id') id: string,
    @Body() body: { permissions: string[] }
  ): Promise<RoleResponseDto> {
    return this.rolesService.updatePermissions(id, body.permissions);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate role' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Role activated successfully', type: RoleResponseDto })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 400, description: 'Cannot activate system roles' })
  async activate(@Param('id') id: string): Promise<RoleResponseDto> {
    return this.rolesService.activate(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate role' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Role deactivated successfully', type: RoleResponseDto })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 400, description: 'Cannot deactivate system roles' })
  async deactivate(@Param('id') id: string): Promise<RoleResponseDto> {
    return this.rolesService.deactivate(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete role' })
  @ApiParam({ name: 'id', description: 'Role ID' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete system roles or roles in use' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.rolesService.remove(id);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed default roles' })
  @ApiResponse({ status: 201, description: 'Default roles seeded successfully' })
  @HttpCode(HttpStatus.CREATED)
  async seedDefaultRoles(): Promise<void> {
    return this.rolesService.seedDefaultRoles();
  }
}

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleResponseDto } from './dto/role-response.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    // Check if role already exists
    const existingRole = await this.roleModel.findOne({ 
      name: createRoleDto.name,
      organizationId: createRoleDto.organizationId || null
    });
    if (existingRole) {
      throw new ConflictException('Role with this name already exists');
    }

    // Create role
    const role = new this.roleModel(createRoleDto);
    const savedRole = await role.save();

    return this.transformToResponseDto(savedRole);
  }

  async findAll(organizationId?: string): Promise<RoleResponseDto[]> {
    const filter: any = { isActive: true };
    if (organizationId) {
      filter.$or = [
        { organizationId: organizationId },
        { organizationId: { $exists: false } }, // Global roles
      ];
    }

    const roles = await this.roleModel
      .find(filter)
      .populate('organizationId', 'name')
      .sort({ name: 1 })
      .exec();

    return roles.map(role => this.transformToResponseDto(role));
  }

  async findOne(id: string): Promise<RoleResponseDto> {
    const role = await this.roleModel
      .findById(id)
      .populate('organizationId', 'name')
      .exec();

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return this.transformToResponseDto(role);
  }

  async findByName(name: string, organizationId?: string): Promise<RoleResponseDto | null> {
    const filter: any = { name };
    if (organizationId) {
      filter.$or = [
        { organizationId: organizationId },
        { organizationId: { $exists: false } }, // Global roles
      ];
    }

    const role = await this.roleModel.findOne(filter).exec();
    return role ? this.transformToResponseDto(role) : null;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<RoleResponseDto> {
    const role = await this.roleModel.findById(id).exec();
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check if role is system role
    if (role.isSystem) {
      throw new BadRequestException('Cannot modify system roles');
    }

    // Check name uniqueness if name is being updated
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.roleModel.findOne({ 
        name: updateRoleDto.name,
        organizationId: updateRoleDto.organizationId || role.organizationId || null
      });
      if (existingRole) {
        throw new ConflictException('Role with this name already exists');
      }
    }

    // Update role
    Object.assign(role, updateRoleDto);
    const updatedRole = await role.save();

    return this.transformToResponseDto(updatedRole);
  }

  async remove(id: string): Promise<void> {
    const role = await this.roleModel.findById(id).exec();
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check if role is system role
    if (role.isSystem) {
      throw new BadRequestException('Cannot delete system roles');
    }

    // Check if role is in use
    const userCount = await this.roleModel.aggregate([
      { $match: { _id: role._id } },
      { $lookup: { from: 'users', localField: '_id', foreignField: 'roles', as: 'users' } },
      { $project: { userCount: { $size: '$users' } } }
    ]);

    if (userCount.length > 0 && userCount[0].userCount > 0) {
      throw new BadRequestException('Cannot delete role that is assigned to users');
    }

    await this.roleModel.findByIdAndDelete(id).exec();
  }

  async deactivate(id: string): Promise<RoleResponseDto> {
    const role = await this.roleModel.findById(id).exec();
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystem) {
      throw new BadRequestException('Cannot deactivate system roles');
    }

    role.isActive = false;
    const updatedRole = await role.save();

    return this.transformToResponseDto(updatedRole);
  }

  async activate(id: string): Promise<RoleResponseDto> {
    const role = await this.roleModel.findById(id).exec();
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    role.isActive = true;
    const updatedRole = await role.save();

    return this.transformToResponseDto(updatedRole);
  }

  async updatePermissions(id: string, permissions: string[]): Promise<RoleResponseDto> {
    const role = await this.roleModel.findById(id).exec();
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role.isSystem) {
      throw new BadRequestException('Cannot modify system roles');
    }

    role.permissions = permissions;
    const updatedRole = await role.save();

    return this.transformToResponseDto(updatedRole);
  }

  async getRolesByOrganization(organizationId: string): Promise<RoleResponseDto[]> {
    const roles = await this.roleModel
      .find({
        $or: [
          { organizationId: organizationId },
          { organizationId: { $exists: false } }, // Global roles
        ],
        isActive: true
      })
      .populate('organizationId', 'name')
      .sort({ name: 1 })
      .exec();

    return roles.map(role => this.transformToResponseDto(role));
  }

  async getSystemRoles(): Promise<RoleResponseDto[]> {
    const roles = await this.roleModel
      .find({ isSystem: true, isActive: true })
      .sort({ name: 1 })
      .exec();

    return roles.map(role => this.transformToResponseDto(role));
  }

  async getRolesStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    system: number;
    custom: number;
    byOrganization: Record<string, number>;
  }> {
    const [
      total,
      active,
      inactive,
      system,
      custom,
      organizationStats,
    ] = await Promise.all([
      this.roleModel.countDocuments(),
      this.roleModel.countDocuments({ isActive: true }),
      this.roleModel.countDocuments({ isActive: false }),
      this.roleModel.countDocuments({ isSystem: true }),
      this.roleModel.countDocuments({ isSystem: false }),
      this.roleModel.aggregate([
        { $group: { _id: '$organizationId', count: { $sum: 1 } } },
      ]),
    ]);

    const byOrganization = organizationStats.reduce((acc, item) => {
      acc[item._id ? item._id.toString() : 'Global'] = item.count;
      return acc;
    }, {});

    return {
      total,
      active,
      inactive,
      system,
      custom,
      byOrganization,
    };
  }

  async seedDefaultRoles(): Promise<void> {
    const defaultRoles = [
      {
        name: 'Super Admin',
        description: 'Full system access with all permissions',
        permissions: ['*'],
        isSystem: true,
        isActive: true,
      },
      {
        name: 'Admin',
        description: 'Administrative access to most system features',
        permissions: [
          'users:read', 'users:write', 'users:delete',
          'roles:read', 'roles:write', 'roles:delete',
          'organizations:read', 'organizations:write', 'organizations:delete',
          'leads:read', 'leads:write', 'leads:delete',
          'transactions:read', 'transactions:write', 'transactions:delete',
          'analytics:read', 'settings:read', 'settings:write'
        ],
        isSystem: true,
        isActive: true,
      },
      {
        name: 'Acquisitions',
        description: 'Role for acquisition team members',
        permissions: [
          'leads:read', 'leads:write',
          'transactions:read', 'transactions:write',
          'analytics:read'
        ],
        isSystem: true,
        isActive: true,
      },
      {
        name: 'Dispositions',
        description: 'Role for disposition team members',
        permissions: [
          'leads:read', 'leads:write',
          'transactions:read', 'transactions:write',
          'analytics:read'
        ],
        isSystem: true,
        isActive: true,
      },
      {
        name: 'Aquisition Manager',
        description: 'Acquisition manager with elevated permissions',
        permissions: [
          'leads:read', 'leads:write', 'leads:delete',
          'transactions:read', 'transactions:write',
          'analytics:read'
        ],
        isSystem: true,
        isActive: true,
      },
      {
        name: 'Disposition Agent',
        description: 'Disposition agent handling sales and assignments',
        permissions: [
          'leads:read', 'leads:write',
          'transactions:read', 'transactions:write',
          'analytics:read'
        ],
        isSystem: true,
        isActive: true,
      },
      {
        name: 'Transaction Coordinator',
        description: 'Role for transaction coordination team members',
        permissions: [
          'leads:read', 'leads:write',
          'transactions:read', 'transactions:write',
          'analytics:read'
        ],
        isSystem: true,
        isActive: true,
      },
    ];

    for (const roleData of defaultRoles) {
      const existingRole = await this.roleModel.findOne({ name: roleData.name });
      if (!existingRole) {
        await this.roleModel.create(roleData);
      }
    }
  }

  private transformToResponseDto(role: RoleDocument): RoleResponseDto {
    return plainToClass(RoleResponseDto, role.toObject(), {
      excludeExtraneousValues: true,
    });
  }
}

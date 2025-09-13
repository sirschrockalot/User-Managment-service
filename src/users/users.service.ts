import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email: createUserDto.email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

    // Create user
    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      passwordChangedAt: new Date(),
    });

    const savedUser = await user.save();
    return this.transformToResponseDto(savedUser);
  }

  async findAll(queryDto: QueryUsersDto): Promise<{ users: UserResponseDto[]; total: number; page: number; limit: number }> {
    const {
      search,
      role,
      roles,
      department,
      organizationId,
      isActive,
      isEmailVerified,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includeInactive = false,
    } = queryDto;

    // Build filter
    const filter: any = {};

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) {
      filter.roles = { $in: [role] };
    }

    if (roles && roles.length > 0) {
      filter.roles = { $in: roles };
    }

    if (department) {
      filter.department = { $regex: department, $options: 'i' };
    }

    if (organizationId) {
      filter.organizationId = organizationId;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    if (isEmailVerified !== undefined) {
      filter.isEmailVerified = isEmailVerified;
    }

    if (!includeInactive) {
      filter.isActive = true;
    }

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.userModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('organizationId', 'name')
        .populate('departmentId', 'name')
        .exec(),
      this.userModel.countDocuments(filter),
    ]);

    return {
      users: users.map(user => this.transformToResponseDto(user)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userModel
      .findById(id)
      .populate('organizationId', 'name')
      .populate('departmentId', 'name')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.transformToResponseDto(user);
  }

  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.userModel.findOne({ email }).exec();
    return user ? this.transformToResponseDto(user) : null;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check email uniqueness if email is being updated
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userModel.findOne({ email: updateUserDto.email });
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Update user
    Object.assign(user, updateUserDto);
    const updatedUser = await user.save();

    return this.transformToResponseDto(updatedUser);
  }

  async remove(id: string): Promise<void> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userModel.findByIdAndDelete(id).exec();
  }

  async deactivate(id: string): Promise<UserResponseDto> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActive = false;
    const updatedUser = await user.save();

    return this.transformToResponseDto(updatedUser);
  }

  async activate(id: string): Promise<UserResponseDto> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActive = true;
    const updatedUser = await user.save();

    return this.transformToResponseDto(updatedUser);
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password = hashedPassword;
    user.passwordChangedAt = new Date();

    await user.save();
  }

  async verifyPassword(id: string, password: string): Promise<boolean> {
    const user = await this.userModel.findById(id).select('+password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return bcrypt.compare(password, user.password);
  }

  async updateLastLogin(id: string, ipAddress?: string): Promise<void> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.lastLoginAt = new Date();
    if (ipAddress) {
      user.loginHistory.push(ipAddress);
      // Keep only last 10 login IPs
      if (user.loginHistory.length > 10) {
        user.loginHistory = user.loginHistory.slice(-10);
      }
    }

    await user.save();
  }

  async updateRoles(id: string, roles: string[]): Promise<UserResponseDto> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.roles = roles;
    const updatedUser = await user.save();

    return this.transformToResponseDto(updatedUser);
  }

  async updatePreferences(id: string, preferences: Record<string, any>): Promise<UserResponseDto> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.preferences = { ...user.preferences, ...preferences };
    const updatedUser = await user.save();

    return this.transformToResponseDto(updatedUser);
  }

  async getUsersByRole(role: string): Promise<UserResponseDto[]> {
    const users = await this.userModel
      .find({ roles: { $in: [role] }, isActive: true })
      .populate('organizationId', 'name')
      .populate('departmentId', 'name')
      .exec();

    return users.map(user => this.transformToResponseDto(user));
  }

  async getUsersByOrganization(organizationId: string): Promise<UserResponseDto[]> {
    const users = await this.userModel
      .find({ organizationId, isActive: true })
      .populate('organizationId', 'name')
      .populate('departmentId', 'name')
      .exec();

    return users.map(user => this.transformToResponseDto(user));
  }

  async getUsersByDepartment(departmentId: string): Promise<UserResponseDto[]> {
    const users = await this.userModel
      .find({ departmentId, isActive: true })
      .populate('organizationId', 'name')
      .populate('departmentId', 'name')
      .exec();

    return users.map(user => this.transformToResponseDto(user));
  }

  async getUsersStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    verified: number;
    unverified: number;
    byRole: Record<string, number>;
    byDepartment: Record<string, number>;
  }> {
    const [
      total,
      active,
      inactive,
      verified,
      unverified,
      roleStats,
      departmentStats,
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ isActive: true }),
      this.userModel.countDocuments({ isActive: false }),
      this.userModel.countDocuments({ isEmailVerified: true }),
      this.userModel.countDocuments({ isEmailVerified: false }),
      this.userModel.aggregate([
        { $unwind: '$roles' },
        { $group: { _id: '$roles', count: { $sum: 1 } } },
      ]),
      this.userModel.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
      ]),
    ]);

    const byRole = roleStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const byDepartment = departmentStats.reduce((acc, item) => {
      acc[item._id || 'No Department'] = item.count;
      return acc;
    }, {});

    return {
      total,
      active,
      inactive,
      verified,
      unverified,
      byRole,
      byDepartment,
    };
  }

  private transformToResponseDto(user: UserDocument): UserResponseDto {
    return plainToClass(UserResponseDto, user.toObject(), {
      excludeExtraneousValues: true,
    });
  }
}

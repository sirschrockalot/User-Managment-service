import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop()
  phone?: string;

  @Prop()
  title?: string;

  @Prop()
  department?: string;

  @Prop()
  avatar?: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [String], default: [] })
  roles: string[];

  @Prop({ type: Types.ObjectId, ref: 'Organization' })
  organizationId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Organization' })
  departmentId?: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ default: false })
  isMfaEnabled: boolean;

  @Prop()
  mfaSecret?: string;

  @Prop({ type: [String], default: [] })
  backupCodes: string[];

  @Prop()
  lastLoginAt?: Date;

  @Prop()
  passwordChangedAt?: Date;

  @Prop({ type: [String], default: [] })
  loginHistory: string[];

  @Prop({ type: Object, default: {} })
  preferences: Record<string, any>;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ organizationId: 1 });
UserSchema.index({ departmentId: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ roles: 1 });
UserSchema.index({ createdAt: -1 });

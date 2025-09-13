import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configService: ConfigService) {}

  getHealth() {
    return {
      status: 'healthy',
      service: 'user-management-service',
      version: this.configService.get('SERVICE_VERSION', '1.0.0'),
      timestamp: new Date().toISOString(),
    };
  }

  getDetailedHealth() {
    return {
      status: 'healthy',
      service: 'user-management-service',
      version: this.configService.get('SERVICE_VERSION', '1.0.0'),
      environment: this.configService.get('NODE_ENV', 'development'),
      port: this.configService.get('PORT', 3005),
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      features: {
        users: 'enabled',
        roles: 'enabled',
        permissions: 'enabled',
        organizations: 'enabled',
        authentication: 'enabled',
      },
    };
  }
}

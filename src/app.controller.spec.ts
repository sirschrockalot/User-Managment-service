import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return health status', () => {
      const result = appController.getHealth();
      expect(result).toHaveProperty('status', 'healthy');
      expect(result).toHaveProperty('service', 'user-management-service');
    });

    it('should return detailed health status', () => {
      const result = appController.getDetailedHealth();
      expect(result).toHaveProperty('status', 'healthy');
      expect(result).toHaveProperty('service', 'user-management-service');
      expect(result).toHaveProperty('features');
    });
  });
});

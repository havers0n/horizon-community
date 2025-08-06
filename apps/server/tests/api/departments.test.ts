import request from 'supertest';
import type { Express } from 'express';
import { createTestApp } from '../helpers/app-factory';
import type { ServicesContainer } from '../../src/types/services';
import { AppError } from '../../src/utils/AppError';

describe('Departments API (/api/v1/departments)', () => {
  let app: Express;
  let services: ServicesContainer;

  beforeEach(() => {
    const testApp = createTestApp();
    app = testApp.app;
    services = testApp.services;
    jest.clearAllMocks();
  });

  const mockDepartment = {
    id: 1,
    name: 'Los Santos Police Department',
  };

  describe('GET /', () => {
    it('should return all departments', async () => {
      (services.departmentService.getAllDepartments as jest.Mock).mockResolvedValue([mockDepartment]);

      const response = await request(app)
        .get('/api/v1/departments')
        .expect(200);

      expect(response.body).toEqual([mockDepartment]);
      expect(services.departmentService.getAllDepartments).toHaveBeenCalled();
    });
  });

  describe('GET /:id', () => {
    it('should return a specific department', async () => {
      (services.departmentService.getDepartmentById as jest.Mock).mockResolvedValue(mockDepartment);

      const response = await request(app)
        .get('/api/v1/departments/1')
        .expect(200);

      expect(response.body).toEqual(mockDepartment);
      expect(services.departmentService.getDepartmentById).toHaveBeenCalledWith(1);
    });

    it('should return 404 if department not found', async () => {
      (services.departmentService.getDepartmentById as jest.Mock).mockResolvedValue(null);
      
      await request(app)
        .get('/api/v1/departments/999')
        .expect(404);
    });
  });

  describe('POST /', () => {
    it('should create a department', async () => {
      const newDeptData = { name: 'New Department' };
      (services.departmentService.createDepartment as jest.Mock).mockResolvedValue({ id: 2, ...newDeptData });

      const response = await request(app)
        .post('/api/v1/departments')
        .send(newDeptData)
        .expect(201);

      expect(response.body.name).toBe(newDeptData.name);
      expect(services.departmentService.createDepartment).toHaveBeenCalledWith(newDeptData);
    });
  });
}); 
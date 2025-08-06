import { Router } from 'express';
import type { ServicesContainer } from '../../../types/services';
import { DepartmentController } from '../../../core/controllers/DepartmentController';
import { requireRole } from '../../middleware/auth.middleware'; // Assuming this middleware exists and is mocked

export function createDepartmentRoutes(services: ServicesContainer): Router {
  const router = Router();
  // This service will be added to the container in the next steps
  const departmentService = (services as any).departmentService;
  const departmentController = new DepartmentController(departmentService);

  router.get('/', (req, res, next) => departmentController.getAllDepartments(req, res, next));

  router.get('/:id', (req, res, next) => departmentController.getDepartmentById(req, res, next));

  router.get('/:id/members', (req, res, next) => departmentController.getDepartmentMembers(req, res, next));

  // Admin-only routes
  router.post(
    '/',
    requireRole('admin'),
    (req, res, next) => departmentController.createDepartment(req, res, next)
  );

  router.put(
    '/:id',
    requireRole('admin'),
    (req, res, next) => departmentController.updateDepartment(req, res, next)
  );

  router.delete(
    '/:id',
    requireRole('admin'),
    (req, res, next) => departmentController.deleteDepartment(req, res, next)
  );

  return router;
}

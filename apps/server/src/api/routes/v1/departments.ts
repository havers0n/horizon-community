import { Router } from 'express';
import type { ServicesContainer } from '../../../types/services';
import { DepartmentController } from '../../../core/controllers/DepartmentController';
import { requireRole } from '../../middleware/auth.middleware'; // Assuming this middleware exists and is mocked
import type { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { DepartmentService } from '../../../core/services/DepartmentService';

export function createDepartmentRoutes(services: ServicesContainer): Router {
  const router = Router();
  router.get('/', (req: AuthenticatedRequest, res, next) => {
    // Публичный список департаментов приходит из схемы common/public через RPC
    // Поэтому используем per-request клиент публичной схемы
    const departmentService = new DepartmentService(req.supabase!.public);
    const departmentController = new DepartmentController(departmentService);
    return departmentController.getAllDepartments(req, res, next);
  });

  router.get('/:id', (req: AuthenticatedRequest, res, next) => {
    const departmentService = new DepartmentService(req.supabase!.mdt);
    const departmentController = new DepartmentController(departmentService);
    return departmentController.getDepartmentById(req, res, next);
  });

  router.get('/:id/members', (req: AuthenticatedRequest, res, next) => {
    const departmentService = new DepartmentService(req.supabase!.mdt);
    const departmentController = new DepartmentController(departmentService);
    return departmentController.getDepartmentMembers(req, res, next);
  });

  // Admin-only routes
  router.post(
    '/',
    requireRole('admin'),
    (req: AuthenticatedRequest, res, next) => {
      const departmentService = new DepartmentService(req.supabase!.mdt);
      const departmentController = new DepartmentController(departmentService);
      return departmentController.createDepartment(req, res, next);
    }
  );

  router.put(
    '/:id',
    requireRole('admin'),
    (req: AuthenticatedRequest, res, next) => {
      const departmentService = new DepartmentService(req.supabase!.mdt);
      const departmentController = new DepartmentController(departmentService);
      return departmentController.updateDepartment(req, res, next);
    }
  );

  router.delete(
    '/:id',
    requireRole('admin'),
    (req: AuthenticatedRequest, res, next) => {
      const departmentService = new DepartmentService(req.supabase!.mdt);
      const departmentController = new DepartmentController(departmentService);
      return departmentController.deleteDepartment(req, res, next);
    }
  );

  return router;
}

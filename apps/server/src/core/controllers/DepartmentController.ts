import type { NextFunction, Request, Response } from 'express';
import type { DepartmentService } from '../services/DepartmentService';
import { AppError } from '../../utils/AppError';

export class DepartmentController {
  constructor(private departmentService: DepartmentService) {}

  async getAllDepartments(req: Request, res: Response, next: NextFunction) {
    try {
      const departments = await this.departmentService.getAllDepartments();
      res.status(200).json(departments);
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError('Invalid department ID', 400);
      }
      const department = await this.departmentService.getDepartmentById(id);
      if (!department) {
        throw new AppError('Department not found', 404);
      }
      res.status(200).json(department);
    } catch (error) {
      next(error);
    }
  }

  async createDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      // Note: role-based access control should be handled by middleware
      const newDepartment = await this.departmentService.createDepartment(req.body);
      res.status(201).json(newDepartment);
    } catch (error) {
      next(error);
    }
  }

  async updateDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError('Invalid department ID', 400);
      }
      const updatedDepartment = await this.departmentService.updateDepartment(id, req.body);
      res.status(200).json(updatedDepartment);
    } catch (error) {
      next(error);
    }
  }

  async deleteDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        throw new AppError('Invalid department ID', 400);
      }
      // In a real implementation, we'd check for members before deleting
      await this.departmentService.deleteDepartment(id);
      res.status(200).json({ message: 'Department deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getDepartmentMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
       if (isNaN(id)) {
        throw new AppError('Invalid department ID', 400);
      }
      const members = await this.departmentService.getDepartmentMembers(id);
      res.status(200).json(members);
    } catch (error) {
      next(error);
    }
  }
}

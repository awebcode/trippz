import type { Request, Response, NextFunction } from "express";
import { AdminService } from "../services/adminService";
import { catchAsync } from "../utils/catchAsync";
import type {
  AnalyticsQuery,
  SystemSettingsInput,
  UpdateUserRoleInput,
  UserQuery,
} from "../validators/adminValidators";

export class AdminController {
  // User Management
  static getUsers = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const query = req.validatedQuery as unknown as UserQuery;
      const users = await AdminService.getUsers(query);

      res.status(200).json({
        success: true,
        data: users.data,
        metadata: users.metadata,
      });
    }
  );

  static getUserById = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.params.id;
      const user = await AdminService.getUserById(userId);

      res.status(200).json({
        success: true,
        data: user,
      });
    }
  );

  static updateUserRole = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.params.id;
      const { role } = req.body as UpdateUserRoleInput;
      const updatedUser = await AdminService.updateUserRole(userId, role);

      res.status(200).json({
        success: true,
        message: "User role updated successfully",
        data: updatedUser,
      });
    }
  );

  static deleteUser = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.params.id;
      const result = await AdminService.deleteUser(userId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    }
  );

  // Dashboard Analytics
  static getStats = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const stats = await AdminService.getStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    }
  );

  static getAnalytics = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const query = req.validatedQuery as unknown as AnalyticsQuery;
      const analytics = await AdminService.getAnalytics(query);

      res.status(200).json({
        success: true,
        data: analytics,
      });
    }
  );

  // System Settings
  static getSystemSettings = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const settings = await AdminService.getSystemSettings();

      res.status(200).json({
        success: true,
        data: settings,
      });
    }
  );

  static updateSystemSettings = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const data = req.body as SystemSettingsInput;
      const settings = await AdminService.updateSystemSettings(data);

      res.status(200).json({
        success: true,
        message: "System settings updated successfully",
        data: settings,
      });
    }
  );

  // Content Management
  static getAllDestinations = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const query = req.query;
      const destinations = await AdminService.getAllDestinations(query);

      res.status(200).json({
        success: true,
        data: destinations.data,
        metadata: destinations.metadata,
      });
    }
  );
}

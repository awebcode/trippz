import type { Request, Response, NextFunction } from "express"
import { prisma } from "../lib/prisma"
import { AppError } from "../utils/appError"

export const maintenanceMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Skip maintenance check for admin routes and the maintenance status endpoint
    if (req.path.startsWith("/admin") || req.path === "/health" || req.path === "/maintenance-status") {
      return next()
    }

    // Get system settings
    const settings = await prisma.systemSetting.findFirst()

    // If maintenance mode is enabled, return 503 Service Unavailable
    if (settings?.maintenance_mode) {
      throw new AppError("System is currently under maintenance. Please try again later.", 503)
    }

    next()
  } catch (error) {
    if (error instanceof AppError) {
      return next(error)
    }
    next(new AppError("Failed to check maintenance status", 500))
  }
}

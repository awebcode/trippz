import type { Request, Response, NextFunction } from "express"
import { AdminService } from "../services/adminService"
import { catchAsync } from "../utils/catchAsync"

export class AdminController {
  static getUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const users = await AdminService.getUsers()

    res.status(200).json({
      success: true,
      data: users,
    })
  })

  static getUserById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id
    const user = await AdminService.getUserById(userId)

    res.status(200).json({
      success: true,
      data: user,
    })
  })

  static updateUserRole = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id
    const { role } = req.body
    const updatedUser = await AdminService.updateUserRole(userId, role)

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: updatedUser,
    })
  })

  static getStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const stats = await AdminService.getStats()

    res.status(200).json({
      success: true,
      data: stats,
    })
  })

  static getReports = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const reports = await AdminService.getReports()

    res.status(200).json({
      success: true,
      data: reports,
    })
  })
}

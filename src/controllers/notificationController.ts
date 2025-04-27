import type { Request, Response, NextFunction } from "express"
import { NotificationService, type NotificationChannel } from "../services/notificationService"
import { catchAsync } from "../utils/catchAsync"
import { AppError } from "../utils/appError"
import type { NotificationType } from "@prisma/client"

export class NotificationController {
  static getUserNotifications = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.currentUser.id
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 20

    const notifications = await NotificationService.getUserNotifications(userId, page, limit)

    res.status(200).json({
      success: true,
      data: notifications.data,
      metadata: notifications.metadata,
    })
  })

  static getUnreadCount = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.currentUser.id

    const result = await NotificationService.getUnreadCount(userId)

    res.status(200).json({
      success: true,
      data: { unreadCount: result.count },
    })
  })

  static markAsRead = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.currentUser.id
    const notificationId = req.params.id

    const notification = await NotificationService.markAsRead(userId, notificationId)

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    })
  })

  static markAllAsRead = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.currentUser.id

    const result = await NotificationService.markAllAsRead(userId)

    res.status(200).json({
      success: true,
      message: result.message,
      data: { count: result.count },
    })
  })

  static deleteNotification = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.currentUser.id
    const notificationId = req.params.id

    const result = await NotificationService.deleteNotification(userId, notificationId)

    res.status(200).json({
      success: true,
      message: result.message,
    })
  })

  static deleteAllNotifications = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.currentUser.id

    const result = await NotificationService.deleteAllNotifications(userId)

    res.status(200).json({
      success: true,
      message: result.message,
      data: { count: result.count },
    })
  })

  static getNotificationPreferences = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.currentUser.id

    const preferences = await NotificationService.getNotificationPreferences(userId)

    res.status(200).json({
      success: true,
      data: preferences,
    })
  })

  static updateNotificationPreferences = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.currentUser.id
    const preferences = req.body

    const updatedPreferences = await NotificationService.updateNotificationPreferences(userId, preferences)

    res.status(200).json({
      success: true,
      message: "Notification preferences updated successfully",
      data: updatedPreferences,
    })
  })

  // Admin endpoints
  static sendBulkNotification = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { userIds, title, message, type, channels, entityId, entityType, metadata } = req.body

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return next(new AppError("User IDs array is required", 400))
    }

    const result = await NotificationService.sendBulkNotification(userIds, {
      title,
      message,
      type: type as NotificationType,
      channels: channels as NotificationChannel[],
      entityId,
      entityType,
      metadata,
    })

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    })
  })

  static createNotification = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { userId, title, message, type, channels, entityId, entityType, metadata } = req.body

    if (!userId) {
      return next(new AppError("User ID is required", 400))
    }

    const notification = await NotificationService.createNotification(userId, {
      title,
      message,
      type: type as NotificationType,
      channels: channels as NotificationChannel[],
      entityId,
      entityType,
      metadata,
    })

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: notification,
    })
  })
}

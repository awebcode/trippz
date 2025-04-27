import { prisma } from "../lib/prisma"
import { AppError } from "../utils/appError"
import { logger } from "../utils/logger"
import { EmailService } from "../utils/email"
import { SmsService } from "../utils/sms"
import type { NotificationType } from "@prisma/client"

export enum NotificationChannel {
  EMAIL = "EMAIL",
  SMS = "SMS",
  PUSH = "PUSH",
  IN_APP = "IN_APP",
}

export interface NotificationData {
  title: string
  message: string
  type: NotificationType
  channels?: NotificationChannel[]
  entityId?: string
  entityType?: string
  metadata?: Record<string, any>
}

export class NotificationService {
  static async getUserNotifications(userId: string, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit

      const [notifications, totalCount] = await Promise.all([
        prisma.notification.findMany({
          where: { user_id: userId },
          orderBy: { created_at: "desc" },
          skip,
          take: limit,
        }),
        prisma.notification.count({
          where: { user_id: userId },
        }),
      ])

      const totalPages = Math.ceil(totalCount / limit)

      return {
        data: notifications,
        metadata: {
          totalCount,
          filteredCount: notifications.length,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      }
    } catch (error) {
      logger.error(`Error in getUserNotifications: ${error}`)
      throw error instanceof AppError ? error : new AppError("Failed to get user notifications", 500)
    }
  }

  static async getUnreadCount(userId: string) {
    try {
      const count = await prisma.notification.count({
        where: {
          user_id: userId,
          is_read: false,
        },
      })

      return { count }
    } catch (error) {
      logger.error(`Error in getUnreadCount: ${error}`)
      throw error instanceof AppError ? error : new AppError("Failed to get unread notification count", 500)
    }
  }

  static async markAsRead(userId: string, notificationId: string) {
    try {
      // First check if the notification belongs to the user
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          user_id: userId,
        },
      })

      if (!notification) {
        throw new AppError("Notification not found or does not belong to the user", 404)
      }

      // Update the notification
      return await prisma.notification.update({
        where: { id: notificationId },
        data: { is_read: true },
      })
    } catch (error) {
      logger.error(`Error in markAsRead: ${error}`)
      throw error instanceof AppError ? error : new AppError("Failed to mark notification as read", 500)
    }
  }

  static async markAllAsRead(userId: string) {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          user_id: userId,
          is_read: false,
        },
        data: { is_read: true },
      })

      return {
        message: "All notifications marked as read",
        count: result.count,
      }
    } catch (error) {
      logger.error(`Error in markAllAsRead: ${error}`)
      throw error instanceof AppError ? error : new AppError("Failed to mark all notifications as read", 500)
    }
  }

  static async deleteNotification(userId: string, notificationId: string) {
    try {
      // First check if the notification belongs to the user
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          user_id: userId,
        },
      })

      if (!notification) {
        throw new AppError("Notification not found or does not belong to the user", 404)
      }

      // Delete the notification
      await prisma.notification.delete({
        where: { id: notificationId },
      })

      return { message: "Notification deleted successfully" }
    } catch (error) {
      logger.error(`Error in deleteNotification: ${error}`)
      throw error instanceof AppError ? error : new AppError("Failed to delete notification", 500)
    }
  }

  static async deleteAllNotifications(userId: string) {
    try {
      const result = await prisma.notification.deleteMany({
        where: { user_id: userId },
      })

      return {
        message: "All notifications deleted successfully",
        count: result.count,
      }
    } catch (error) {
      logger.error(`Error in deleteAllNotifications: ${error}`)
      throw error instanceof AppError ? error : new AppError("Failed to delete all notifications", 500)
    }
  }

  static async getNotificationPreferences(userId: string) {
    try {
      let preferences = await prisma.notificationPreference.findFirst({
        where: { user_id: userId },
      })

      if (!preferences) {
        // Create default preferences if they don't exist
        preferences = await prisma.notificationPreference.create({
          data: {
            user_id: userId,
            email_enabled: true,
            sms_enabled: true,
            push_enabled: true,
            in_app_enabled: true,
            system_enabled: true,
            booking_enabled: true,
            payment_enabled: true,
            promotional_enabled: false,
            reminder_enabled: true,
            alert_enabled: true,
          },
        })
      }

      return preferences
    } catch (error) {
      logger.error(`Error in getNotificationPreferences: ${error}`)
      throw error instanceof AppError ? error : new AppError("Failed to get notification preferences", 500)
    }
  }

  static async createNotification(userId: string, data: NotificationData) {
    try {
      // Get user notification preferences
      const preferences = await this.getNotificationPreferences(userId)

      // Default channels if not specified
      const channels = data.channels || [NotificationChannel.IN_APP]

      // Map NotificationType to preference field names
      const typeToPreferenceField: Record<NotificationType, keyof typeof preferences> = {
        SYSTEM: "system_enabled",
        BOOKING: "booking_enabled",
        PAYMENT: "payment_enabled",
        PROMOTIONAL: "promotional_enabled",
        REMINDER: "reminder_enabled",
        ALERT: "alert_enabled",
        NEW_BOOKING: "booking_enabled",
        TRIP_UPDATES: "alert_enabled",
        SPECIAL_OFFERS: "promotional_enabled",
      } as const

      // Create notification record
      const notification = await prisma.notification.create({
        data: {
          user_id: userId,
          title: data.title,
          message: data.message,
          notification_type: data.type,
          entity_id: data.entityId,
          entity_type: data.entityType,
          metadata: data.metadata,
          is_read: false,
        },
      })

      // Check if user has enabled this notification type
      const preferenceField = typeToPreferenceField[data.type]
      const typeEnabled = preferences[preferenceField]

      if (typeEnabled) {
        // Send through each enabled channel
        if (channels.includes(NotificationChannel.EMAIL) && preferences.email_enabled) {
          await this.sendEmailNotification(userId, data)
        }
        if (channels.includes(NotificationChannel.SMS) && preferences.sms_enabled) {
          await this.sendSmsNotification(userId, data)
        }
        if (channels.includes(NotificationChannel.PUSH) && preferences.push_enabled) {
          await this.sendPushNotification(userId, data)
        }
      }

      return notification
    } catch (error) {
      logger.error(`Error in createNotification: ${error}`)
      throw error instanceof AppError ? error : new AppError("Failed to create notification", 500)
    }
  }

  static async updateNotificationPreferences(userId: string, preferences: any) {
    try {
      const existingPreferences = await prisma.notificationPreference.findFirst({
        where: { user_id: userId },
      })

      if (!existingPreferences) {
        // Create preferences if they don't exist
        return await prisma.notificationPreference.create({
          data: {
            user_id: userId,
            ...preferences,
          },
        })
      }

      // Update existing preferences
      return await prisma.notificationPreference.update({
        where: { id: existingPreferences.id },
        data: preferences,
      })
    } catch (error) {
      logger.error(`Error in updateNotificationPreferences: ${error}`)
      throw error instanceof AppError ? error : new AppError("Failed to update notification preferences", 500)
    }
  }

  static async sendBulkNotification(userIds: string[], data: NotificationData) {
    try {
      const notifications = []
      const failedNotifications = []

      for (const userId of userIds) {
        try {
          const notification = await this.createNotification(userId, data)
          notifications.push(notification)
        } catch (error) {
          failedNotifications.push({ userId, error: error instanceof Error ? error.message : String(error) })
        }
      }

      return {
        success: true,
        message: `Sent ${notifications.length} notifications successfully${failedNotifications.length > 0 ? `, ${failedNotifications.length} failed` : ""}`,
        data: {
          successful: notifications,
          failed: failedNotifications,
        },
      }
    } catch (error) {
      logger.error(`Error in sendBulkNotification: ${error}`)
      throw error instanceof AppError ? error : new AppError("Failed to send bulk notifications", 500)
    }
  }

  private static async sendEmailNotification(userId: string, data: NotificationData) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (!user || !user.email) {
        logger.warn(`Cannot send email notification to user ${userId}: No email address`)
        return false
      }
      await EmailService.sendNotification(user.email, {
        title: data.title,
        message: data.message,
        notification_type: data.type,
      })
      return true
    } catch (error) {
      logger.error(`Error sending email notification: ${error}`)
      return false
    }
  }

  private static async sendSmsNotification(userId: string, data: NotificationData) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (!user || !user.phone_number) {
        logger.warn(`Cannot send SMS notification to user ${userId}: No phone number`)
        return false
      }
      await SmsService.sendNotification(user.phone_number, data.message)
      return true
    } catch (error) {
      logger.error(`Error sending SMS notification: ${error}`)
      return false
    }
  }

  private static async sendPushNotification(userId: string, data: NotificationData) {
    try {
      const pushTokens = await prisma.pushToken.findMany({ where: { user_id: userId } })
      if (!pushTokens.length) {
        logger.warn(`Cannot send push notification to user ${userId}: No push tokens`)
        return false
      }
      // In a real implementation, integrate with FCM, APNS, etc.
      logger.info(
        `Would send push notification to user ${userId} with tokens: ${pushTokens.map((t) => t.token).join(", ")}`,
      )
      return true
    } catch (error) {
      logger.error(`Error sending push notification: ${error}`)
      return false
    }
  }
}

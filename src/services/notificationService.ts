import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";
import { logger } from "../utils/logger";
import { EmailService } from "../utils/email";
import { SmsService } from "../utils/sms";
import type { NotificationType } from "@prisma/client";

export enum NotificationChannel {
  EMAIL = "EMAIL",
  SMS = "SMS",
  PUSH = "PUSH",
  IN_APP = "IN_APP",
}

export interface NotificationData {
  title: string;
  message: string;
  type: NotificationType;
  channels?: NotificationChannel[];
  entityId?: string;
  entityType?: string;
  metadata?: Record<string, any>;
}

export class NotificationService {
  static async createNotification(userId: string, data: NotificationData) {
    try {
      // Get user notification preferences
      const preferences = await prisma.notificationPreference.findFirst({
        where: { user_id: userId },
      });

      if (!preferences) {
        throw new AppError("User notification preferences not found", 404);
      }

      // Default channels if not specified
      const channels = data.channels || [NotificationChannel.IN_APP];

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
      } as const;

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
      });

      // Send through selected channels based on user preferences
      if (preferences) {
        // Check if user has enabled this notification type
        const preferenceField = typeToPreferenceField[data.type];
        const typeEnabled = preferences[preferenceField];
        if (typeEnabled) {
          // Send through each enabled channel
          if (channels.includes(NotificationChannel.EMAIL) && preferences.email_enabled) {
            await this.sendEmailNotification(userId, data);
          }
          if (channels.includes(NotificationChannel.SMS) && preferences.sms_enabled) {
            await this.sendSmsNotification(userId, data);
          }
          if (channels.includes(NotificationChannel.PUSH) && preferences.push_enabled) {
            await this.sendPushNotification(userId, data);
          }
        }
      } else {
        // If no preferences, send through all requested channels
        if (channels.includes(NotificationChannel.EMAIL)) {
          await this.sendEmailNotification(userId, data);
        }
        if (channels.includes(NotificationChannel.SMS)) {
          await this.sendSmsNotification(userId, data);
        }
        if (channels.includes(NotificationChannel.PUSH)) {
          await this.sendPushNotification(userId, data);
        }
      }

      return notification;
    } catch (error) {
      logger.error(`Error in createNotification: ${error}`);
      throw error instanceof AppError
        ? error
        : new AppError("Failed to create notification", 500);
    }
  }

  static async updateNotificationPreferences(userId: string, preferences: any) {
    try {
      const existingPreferences = await prisma.notificationPreference.findFirst({
        where: { user_id: userId },
      });

      if (!existingPreferences) {
        // Create preferences if they don't exist
        return await prisma.notificationPreference.create({
          data: {
            user_id: userId,
            ...preferences,
          },
        });
      }

      // Update existing preferences
      return await prisma.notificationPreference.update({
        where: { user_id: userId, id: existingPreferences.id },
        data: preferences,
      });
    } catch (error) {
      logger.error(`Error in updateNotificationPreferences: ${error}`);
      throw error instanceof AppError
        ? error
        : new AppError("Failed to update notification preferences", 500);
    }
  }

  static async sendBulkNotification(userIds: string[], data: NotificationData) {
    try {
      const notifications = [];
      for (const userId of userIds) {
        const notification = await this.createNotification(userId, data);
        notifications.push(notification);
      }
      return {
        success: true,
        message: `Sent ${notifications.length} notifications`,
        data: notifications,
      };
    } catch (error) {
      logger.error(`Error in sendBulkNotification: ${error}`);
      throw error instanceof AppError
        ? error
        : new AppError("Failed to send bulk notifications", 500);
    }
  }

  private static async sendEmailNotification(userId: string, data: NotificationData) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || !user.email) {
        logger.warn(`Cannot send email notification to user ${userId}: No email address`);
        return;
      }
      await EmailService.sendNotification(user.email, {
        title: data.title,
        message: data.message,
        notification_type: data.type,
      });
      return true;
    } catch (error) {
      logger.error(`Error sending email notification: ${error}`);
      return false;
    }
  }

  private static async sendSmsNotification(userId: string, data: NotificationData) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || !user.phone_number) {
        logger.warn(`Cannot send SMS notification to user ${userId}: No phone number`);
        return;
      }
      await SmsService.sendNotification(user.phone_number, data.message);
      return true;
    } catch (error) {
      logger.error(`Error sending SMS notification: ${error}`);
      return false;
    }
  }

  private static async sendPushNotification(userId: string, data: NotificationData) {
    try {
      const pushTokens = await prisma.pushToken.findMany({ where: { user_id: userId } });
      if (!pushTokens.length) {
        logger.warn(`Cannot send push notification to user ${userId}: No push tokens`);
        return;
      }
      // In a real implementation, integrate with FCM, APNS, etc.
      logger.info(
        `Would send push notification to user ${userId} with tokens: ${pushTokens.map((t) => t.token).join(", ")}`
      );
      return true;
    } catch (error) {
      logger.error(`Error sending push notification: ${error}`);
      return false;
    }
  }
}

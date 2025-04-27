import { z } from "zod"

// Notification types from Prisma schema
const notificationTypeEnum = z.enum([
  "SYSTEM",
  "BOOKING",
  "PAYMENT",
  "PROMOTIONAL",
  "REMINDER",
  "ALERT",
  "NEW_BOOKING",
  "TRIP_UPDATES",
  "SPECIAL_OFFERS",
])

// Notification channels
const notificationChannelEnum = z.enum(["EMAIL", "SMS", "PUSH", "IN_APP"])

// Notification preferences schema
export const notificationPreferencesSchema = z.object({
  email_enabled: z.boolean().optional(),
  sms_enabled: z.boolean().optional(),
  push_enabled: z.boolean().optional(),
  in_app_enabled: z.boolean().optional(),
  system_enabled: z.boolean().optional(),
  booking_enabled: z.boolean().optional(),
  payment_enabled: z.boolean().optional(),
  promotional_enabled: z.boolean().optional(),
  reminder_enabled: z.boolean().optional(),
  alert_enabled: z.boolean().optional(),
})

// Bulk notification schema
export const bulkNotificationSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1, "At least one user ID is required"),
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  type: notificationTypeEnum,
  channels: z.array(notificationChannelEnum).optional(),
  entityId: z.string().uuid().optional(),
  entityType: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

// Create notification schema
export const createNotificationSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  type: notificationTypeEnum,
  channels: z.array(notificationChannelEnum).optional(),
  entityId: z.string().uuid().optional(),
  entityType: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

// Types for TypeScript
export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>
export type BulkNotificationInput = z.infer<typeof bulkNotificationSchema>
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>

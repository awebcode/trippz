import { z } from "zod"
import {  NotificationChannel } from "../services/notificationService"
import { NotificationType } from "@prisma/client"

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

export const bulkNotificationSchema = z.object({
  userIds: z.array(z.string().uuid()),
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  type: z.nativeEnum(NotificationType),
  channels: z.array(z.nativeEnum(NotificationChannel)).optional(),
  entityId: z.string().uuid().optional(),
  entityType: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>
export type BulkNotificationInput = z.infer<typeof bulkNotificationSchema>

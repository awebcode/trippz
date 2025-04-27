"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotificationSchema = exports.bulkNotificationSchema = exports.notificationPreferencesSchema = void 0;
const zod_1 = require("zod");
// Notification types from Prisma schema
const notificationTypeEnum = zod_1.z.enum([
    "SYSTEM",
    "BOOKING",
    "PAYMENT",
    "PROMOTIONAL",
    "REMINDER",
    "ALERT",
    "NEW_BOOKING",
    "TRIP_UPDATES",
    "SPECIAL_OFFERS",
]);
// Notification channels
const notificationChannelEnum = zod_1.z.enum(["EMAIL", "SMS", "PUSH", "IN_APP"]);
// Notification preferences schema
exports.notificationPreferencesSchema = zod_1.z.object({
    email_enabled: zod_1.z.boolean().optional(),
    sms_enabled: zod_1.z.boolean().optional(),
    push_enabled: zod_1.z.boolean().optional(),
    in_app_enabled: zod_1.z.boolean().optional(),
    system_enabled: zod_1.z.boolean().optional(),
    booking_enabled: zod_1.z.boolean().optional(),
    payment_enabled: zod_1.z.boolean().optional(),
    promotional_enabled: zod_1.z.boolean().optional(),
    reminder_enabled: zod_1.z.boolean().optional(),
    alert_enabled: zod_1.z.boolean().optional(),
});
// Bulk notification schema
exports.bulkNotificationSchema = zod_1.z.object({
    userIds: zod_1.z.array(zod_1.z.string().uuid()).min(1, "At least one user ID is required"),
    title: zod_1.z.string().min(1, "Title is required"),
    message: zod_1.z.string().min(1, "Message is required"),
    type: notificationTypeEnum,
    channels: zod_1.z.array(notificationChannelEnum).optional(),
    entityId: zod_1.z.string().uuid().optional(),
    entityType: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
// Create notification schema
exports.createNotificationSchema = zod_1.z.object({
    userId: zod_1.z.string().uuid(),
    title: zod_1.z.string().min(1, "Title is required"),
    message: zod_1.z.string().min(1, "Message is required"),
    type: notificationTypeEnum,
    channels: zod_1.z.array(notificationChannelEnum).optional(),
    entityId: zod_1.z.string().uuid().optional(),
    entityType: zod_1.z.string().optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
//# sourceMappingURL=notificationValidators.js.map
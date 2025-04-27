import { z } from "zod";
export declare const notificationPreferencesSchema: z.ZodObject<{
    email_enabled: z.ZodOptional<z.ZodBoolean>;
    sms_enabled: z.ZodOptional<z.ZodBoolean>;
    push_enabled: z.ZodOptional<z.ZodBoolean>;
    in_app_enabled: z.ZodOptional<z.ZodBoolean>;
    system_enabled: z.ZodOptional<z.ZodBoolean>;
    booking_enabled: z.ZodOptional<z.ZodBoolean>;
    payment_enabled: z.ZodOptional<z.ZodBoolean>;
    promotional_enabled: z.ZodOptional<z.ZodBoolean>;
    reminder_enabled: z.ZodOptional<z.ZodBoolean>;
    alert_enabled: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    email_enabled?: boolean | undefined;
    sms_enabled?: boolean | undefined;
    push_enabled?: boolean | undefined;
    in_app_enabled?: boolean | undefined;
    system_enabled?: boolean | undefined;
    booking_enabled?: boolean | undefined;
    payment_enabled?: boolean | undefined;
    promotional_enabled?: boolean | undefined;
    reminder_enabled?: boolean | undefined;
    alert_enabled?: boolean | undefined;
}, {
    email_enabled?: boolean | undefined;
    sms_enabled?: boolean | undefined;
    push_enabled?: boolean | undefined;
    in_app_enabled?: boolean | undefined;
    system_enabled?: boolean | undefined;
    booking_enabled?: boolean | undefined;
    payment_enabled?: boolean | undefined;
    promotional_enabled?: boolean | undefined;
    reminder_enabled?: boolean | undefined;
    alert_enabled?: boolean | undefined;
}>;
export declare const bulkNotificationSchema: z.ZodObject<{
    userIds: z.ZodArray<z.ZodString, "many">;
    title: z.ZodString;
    message: z.ZodString;
    type: z.ZodEnum<["SYSTEM", "BOOKING", "PAYMENT", "PROMOTIONAL", "REMINDER", "ALERT", "NEW_BOOKING", "TRIP_UPDATES", "SPECIAL_OFFERS"]>;
    channels: z.ZodOptional<z.ZodArray<z.ZodEnum<["EMAIL", "SMS", "PUSH", "IN_APP"]>, "many">>;
    entityId: z.ZodOptional<z.ZodString>;
    entityType: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    type: "PAYMENT" | "SYSTEM" | "BOOKING" | "PROMOTIONAL" | "REMINDER" | "ALERT" | "NEW_BOOKING" | "TRIP_UPDATES" | "SPECIAL_OFFERS";
    message: string;
    title: string;
    userIds: string[];
    metadata?: Record<string, any> | undefined;
    entityType?: string | undefined;
    channels?: ("EMAIL" | "SMS" | "PUSH" | "IN_APP")[] | undefined;
    entityId?: string | undefined;
}, {
    type: "PAYMENT" | "SYSTEM" | "BOOKING" | "PROMOTIONAL" | "REMINDER" | "ALERT" | "NEW_BOOKING" | "TRIP_UPDATES" | "SPECIAL_OFFERS";
    message: string;
    title: string;
    userIds: string[];
    metadata?: Record<string, any> | undefined;
    entityType?: string | undefined;
    channels?: ("EMAIL" | "SMS" | "PUSH" | "IN_APP")[] | undefined;
    entityId?: string | undefined;
}>;
export declare const createNotificationSchema: z.ZodObject<{
    userId: z.ZodString;
    title: z.ZodString;
    message: z.ZodString;
    type: z.ZodEnum<["SYSTEM", "BOOKING", "PAYMENT", "PROMOTIONAL", "REMINDER", "ALERT", "NEW_BOOKING", "TRIP_UPDATES", "SPECIAL_OFFERS"]>;
    channels: z.ZodOptional<z.ZodArray<z.ZodEnum<["EMAIL", "SMS", "PUSH", "IN_APP"]>, "many">>;
    entityId: z.ZodOptional<z.ZodString>;
    entityType: z.ZodOptional<z.ZodString>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    type: "PAYMENT" | "SYSTEM" | "BOOKING" | "PROMOTIONAL" | "REMINDER" | "ALERT" | "NEW_BOOKING" | "TRIP_UPDATES" | "SPECIAL_OFFERS";
    userId: string;
    message: string;
    title: string;
    metadata?: Record<string, any> | undefined;
    entityType?: string | undefined;
    channels?: ("EMAIL" | "SMS" | "PUSH" | "IN_APP")[] | undefined;
    entityId?: string | undefined;
}, {
    type: "PAYMENT" | "SYSTEM" | "BOOKING" | "PROMOTIONAL" | "REMINDER" | "ALERT" | "NEW_BOOKING" | "TRIP_UPDATES" | "SPECIAL_OFFERS";
    userId: string;
    message: string;
    title: string;
    metadata?: Record<string, any> | undefined;
    entityType?: string | undefined;
    channels?: ("EMAIL" | "SMS" | "PUSH" | "IN_APP")[] | undefined;
    entityId?: string | undefined;
}>;
export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;
export type BulkNotificationInput = z.infer<typeof bulkNotificationSchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
//# sourceMappingURL=notificationValidators.d.ts.map
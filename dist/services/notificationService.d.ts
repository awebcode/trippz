import type { NotificationType } from "@prisma/client";
export declare enum NotificationChannel {
    EMAIL = "EMAIL",
    SMS = "SMS",
    PUSH = "PUSH",
    IN_APP = "IN_APP"
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
export declare class NotificationService {
    static getUserNotifications(userId: string, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            created_at: Date;
            message: string;
            user_id: string;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            title: string;
            notification_type: import("@prisma/client").$Enums.NotificationType;
            entity_id: string | null;
            entity_type: string | null;
            is_read: boolean;
        }[];
        metadata: {
            totalCount: number;
            filteredCount: number;
            totalPages: number;
            currentPage: number;
            limit: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }>;
    static getUnreadCount(userId: string): Promise<{
        count: number;
    }>;
    static markAsRead(userId: string, notificationId: string): Promise<{
        id: string;
        created_at: Date;
        message: string;
        user_id: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        title: string;
        notification_type: import("@prisma/client").$Enums.NotificationType;
        entity_id: string | null;
        entity_type: string | null;
        is_read: boolean;
    }>;
    static markAllAsRead(userId: string): Promise<{
        message: string;
        count: number;
    }>;
    static deleteNotification(userId: string, notificationId: string): Promise<{
        message: string;
    }>;
    static deleteAllNotifications(userId: string): Promise<{
        message: string;
        count: number;
    }>;
    static getNotificationPreferences(userId: string): Promise<{
        id: string;
        user_id: string;
        email_enabled: boolean;
        sms_enabled: boolean;
        push_enabled: boolean;
        in_app_enabled: boolean;
        system_enabled: boolean;
        booking_enabled: boolean;
        payment_enabled: boolean;
        promotional_enabled: boolean;
        reminder_enabled: boolean;
        alert_enabled: boolean;
    }>;
    static createNotification(userId: string, data: NotificationData): Promise<{
        id: string;
        created_at: Date;
        message: string;
        user_id: string;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        title: string;
        notification_type: import("@prisma/client").$Enums.NotificationType;
        entity_id: string | null;
        entity_type: string | null;
        is_read: boolean;
    }>;
    static updateNotificationPreferences(userId: string, preferences: any): Promise<{
        id: string;
        user_id: string;
        email_enabled: boolean;
        sms_enabled: boolean;
        push_enabled: boolean;
        in_app_enabled: boolean;
        system_enabled: boolean;
        booking_enabled: boolean;
        payment_enabled: boolean;
        promotional_enabled: boolean;
        reminder_enabled: boolean;
        alert_enabled: boolean;
    }>;
    static sendBulkNotification(userIds: string[], data: NotificationData): Promise<{
        success: boolean;
        message: string;
        data: {
            successful: {
                id: string;
                created_at: Date;
                message: string;
                user_id: string;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
                title: string;
                notification_type: import("@prisma/client").$Enums.NotificationType;
                entity_id: string | null;
                entity_type: string | null;
                is_read: boolean;
            }[];
            failed: {
                userId: string;
                error: string;
            }[];
        };
    }>;
    private static sendEmailNotification;
    private static sendSmsNotification;
    private static sendPushNotification;
}
//# sourceMappingURL=notificationService.d.ts.map
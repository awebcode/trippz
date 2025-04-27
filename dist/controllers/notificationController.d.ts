import type { Request, Response, NextFunction } from "express";
export declare class NotificationController {
    static getUserNotifications: (req: Request, res: Response, next: NextFunction) => void;
    static getUnreadCount: (req: Request, res: Response, next: NextFunction) => void;
    static markAsRead: (req: Request, res: Response, next: NextFunction) => void;
    static markAllAsRead: (req: Request, res: Response, next: NextFunction) => void;
    static deleteNotification: (req: Request, res: Response, next: NextFunction) => void;
    static deleteAllNotifications: (req: Request, res: Response, next: NextFunction) => void;
    static getNotificationPreferences: (req: Request, res: Response, next: NextFunction) => void;
    static updateNotificationPreferences: (req: Request, res: Response, next: NextFunction) => void;
    static sendBulkNotification: (req: Request, res: Response, next: NextFunction) => void;
    static createNotification: (req: Request, res: Response, next: NextFunction) => void;
}
//# sourceMappingURL=notificationController.d.ts.map
"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notificationService_1 = require("../services/notificationService");
const catchAsync_1 = require("../utils/catchAsync");
const appError_1 = require("../utils/appError");
class NotificationController {
}
exports.NotificationController = NotificationController;
_a = NotificationController;
NotificationController.getUserNotifications = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const page = Number.parseInt(req.query.page) || 1;
    const limit = Number.parseInt(req.query.limit) || 20;
    const notifications = await notificationService_1.NotificationService.getUserNotifications(userId, page, limit);
    res.status(200).json({
        success: true,
        data: notifications.data,
        metadata: notifications.metadata,
    });
});
NotificationController.getUnreadCount = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const result = await notificationService_1.NotificationService.getUnreadCount(userId);
    res.status(200).json({
        success: true,
        data: { unreadCount: result.count },
    });
});
NotificationController.markAsRead = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const notificationId = req.params.id;
    const notification = await notificationService_1.NotificationService.markAsRead(userId, notificationId);
    res.status(200).json({
        success: true,
        message: "Notification marked as read",
        data: notification,
    });
});
NotificationController.markAllAsRead = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const result = await notificationService_1.NotificationService.markAllAsRead(userId);
    res.status(200).json({
        success: true,
        message: result.message,
        data: { count: result.count },
    });
});
NotificationController.deleteNotification = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const notificationId = req.params.id;
    const result = await notificationService_1.NotificationService.deleteNotification(userId, notificationId);
    res.status(200).json({
        success: true,
        message: result.message,
    });
});
NotificationController.deleteAllNotifications = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const result = await notificationService_1.NotificationService.deleteAllNotifications(userId);
    res.status(200).json({
        success: true,
        message: result.message,
        data: { count: result.count },
    });
});
NotificationController.getNotificationPreferences = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const preferences = await notificationService_1.NotificationService.getNotificationPreferences(userId);
    res.status(200).json({
        success: true,
        data: preferences,
    });
});
NotificationController.updateNotificationPreferences = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const preferences = req.body;
    const updatedPreferences = await notificationService_1.NotificationService.updateNotificationPreferences(userId, preferences);
    res.status(200).json({
        success: true,
        message: "Notification preferences updated successfully",
        data: updatedPreferences,
    });
});
// Admin endpoints
NotificationController.sendBulkNotification = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { userIds, title, message, type, channels, entityId, entityType, metadata } = req.body;
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return next(new appError_1.AppError("User IDs array is required", 400));
    }
    const result = await notificationService_1.NotificationService.sendBulkNotification(userIds, {
        title,
        message,
        type: type,
        channels: channels,
        entityId,
        entityType,
        metadata,
    });
    res.status(200).json({
        success: true,
        message: result.message,
        data: result.data,
    });
});
NotificationController.createNotification = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { userId, title, message, type, channels, entityId, entityType, metadata } = req.body;
    if (!userId) {
        return next(new appError_1.AppError("User ID is required", 400));
    }
    const notification = await notificationService_1.NotificationService.createNotification(userId, {
        title,
        message,
        type: type,
        channels: channels,
        entityId,
        entityType,
        metadata,
    });
    res.status(201).json({
        success: true,
        message: "Notification created successfully",
        data: notification,
    });
});
//# sourceMappingURL=notificationController.js.map
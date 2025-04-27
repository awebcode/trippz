"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const notificationController_1 = require("../controllers/notificationController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validateRequest_1 = require("../middleware/validateRequest");
const notificationValidators_1 = require("../validators/notificationValidators");
const commonValidators_1 = require("../validators/commonValidators");
const router = express_1.default.Router();
exports.notificationRoutes = router;
// Protect all routes
router.use(authMiddleware_1.protect);
// User notification routes
router.get("/", notificationController_1.NotificationController.getUserNotifications);
router.get("/unread-count", notificationController_1.NotificationController.getUnreadCount);
router.put("/:id/read", (0, validateRequest_1.validateRequest)({ params: commonValidators_1.idParamSchema }), notificationController_1.NotificationController.markAsRead);
router.put("/read-all", notificationController_1.NotificationController.markAllAsRead);
router.delete("/:id", (0, validateRequest_1.validateRequest)({ params: commonValidators_1.idParamSchema }), notificationController_1.NotificationController.deleteNotification);
router.delete("/all", notificationController_1.NotificationController.deleteAllNotifications);
// Notification preferences
router.get("/preferences", notificationController_1.NotificationController.getNotificationPreferences);
router.put("/preferences", (0, validateRequest_1.validateRequest)({ body: notificationValidators_1.notificationPreferencesSchema }), notificationController_1.NotificationController.updateNotificationPreferences);
// Admin routes
router.post("/bulk", (0, authMiddleware_1.restrictTo)("ADMIN"), (0, validateRequest_1.validateRequest)({ body: notificationValidators_1.bulkNotificationSchema }), notificationController_1.NotificationController.sendBulkNotification);
router.post("/", (0, authMiddleware_1.restrictTo)("ADMIN"), (0, validateRequest_1.validateRequest)({ body: notificationValidators_1.createNotificationSchema }), notificationController_1.NotificationController.createNotification);
//# sourceMappingURL=notificationRoutes.js.map
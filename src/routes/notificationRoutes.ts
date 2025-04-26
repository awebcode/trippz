import express from "express"
import { NotificationController } from "../controllers/notificationController"
import { protect, restrictTo } from "../middleware/authMiddleware"
import { validateRequest } from "../middleware/validateRequest"
import { notificationPreferencesSchema, bulkNotificationSchema } from "../validators/notificationValidators"
import { idParamSchema } from "../validators/commonValidators"

const router = express.Router()

// Protect all routes
router.use(protect)

// User notification routes
router.get("/", NotificationController.getUserNotifications)
router.put("/:id/read", validateRequest({ params: idParamSchema }), NotificationController.markAsRead)
router.put("/read-all", NotificationController.markAllAsRead)
router.delete("/:id", validateRequest({ params: idParamSchema }), NotificationController.deleteNotification)

// Notification preferences
router.get("/preferences", NotificationController.getNotificationPreferences)
router.put(
  "/preferences",
  validateRequest({ body: notificationPreferencesSchema }),
  NotificationController.updateNotificationPreferences,
)

// Admin routes
router.post(
  "/bulk",
  restrictTo("ADMIN"),
  validateRequest({ body: bulkNotificationSchema }),
  NotificationController.sendBulkNotification,
)

export { router as notificationRoutes }

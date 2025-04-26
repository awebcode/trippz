import express from "express"
import { AdminController } from "../controllers/adminController"
import { DestinationController } from "../controllers/destinationController"
import { protect, restrictTo } from "../middleware/authMiddleware"
import { validateRequest } from "../middleware/validateRequest"
import { destinationSchema } from "../validators/destinationValidators"
import { uploadMultipleFiles } from "../utils/fileUpload"
import {
  analyticsQuerySchema,
  systemSettingsSchema,
  updateUserRoleSchema,
  userQuerySchema,
} from "../validators/adminValidators"
import { idParamSchema } from "../validators/commonValidators"

const router = express.Router()

// All routes are protected and restricted to admin
router.use(protect)
router.use(restrictTo("ADMIN"))

// User management
router.get("/users", validateRequest({ query: userQuerySchema }), AdminController.getUsers)

router.get("/users/:id", validateRequest({ params: idParamSchema }), AdminController.getUserById)

router.put(
  "/users/:id/role",
  validateRequest({
    params: idParamSchema,
    body: updateUserRoleSchema,
  }),
  AdminController.updateUserRole,
)

router.delete("/users/:id", validateRequest({ params: idParamSchema }), AdminController.deleteUser)

// Dashboard analytics
router.get("/stats", AdminController.getStats)

router.get("/analytics", validateRequest({ query: analyticsQuerySchema }), AdminController.getAnalytics)

// System settings
router.get("/settings", AdminController.getSystemSettings)

router.put("/settings", validateRequest({ body: systemSettingsSchema }), AdminController.updateSystemSettings)

// Content management - Destinations
router.get("/destinations", AdminController.getAllDestinations)

router.post(
  "/destinations",
  uploadMultipleFiles,
  validateRequest({ body: destinationSchema }),
  DestinationController.createDestination,
)

router.get("/destinations/:id", validateRequest({ params: idParamSchema }), DestinationController.getDestinationById)

router.put(
  "/destinations/:id",
  uploadMultipleFiles,
  validateRequest({
    params: idParamSchema,
    body: destinationSchema,
  }),
  DestinationController.updateDestination,
)

router.delete("/destinations/:id", validateRequest({ params: idParamSchema }), DestinationController.deleteDestination)

export { router as adminRoutes }

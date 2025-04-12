import express from "express"
import { AdminController } from "../controllers/adminController"
import { DestinationController } from "../controllers/destinationController"
import { protect, restrictTo } from "../middleware/authMiddleware"
import { validateRequest } from "../middleware/validateRequest"
import { destinationSchema } from "../validators/destinationValidators"
import { uploadMultipleFiles } from "../utils/fileUpload"

const router = express.Router()

// All routes are protected and restricted to admin
router.use(protect)
router.use(restrictTo("ADMIN"))

// User management
router.get("/users", AdminController.getUsers)
router.get("/users/:id", AdminController.getUserById)
router.put("/users/:id/role", AdminController.updateUserRole)

// Destination management
router.post(
  "/destinations",
  uploadMultipleFiles,
  validateRequest({ body: destinationSchema }),
  DestinationController.createDestination,
)
router.get("/destinations", DestinationController.getDestinations)
router.get("/destinations/:id", DestinationController.getDestinationById)
router.put(
  "/destinations/:id",
  uploadMultipleFiles,
  validateRequest({ body: destinationSchema }),
  DestinationController.updateDestination,
)
router.delete("/destinations/:id", DestinationController.deleteDestination)

// Stats and reports
router.get("/stats", AdminController.getStats)
router.get("/reports", AdminController.getReports)

export { router as adminRoutes }

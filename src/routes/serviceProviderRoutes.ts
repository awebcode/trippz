import express from "express"
import { ServiceProviderController } from "../controllers/serviceProviderController"
import { protect, restrictTo } from "../middleware/authMiddleware"
import { validateRequest } from "../middleware/validateRequest"
import {
  serviceProviderProfileSchema,
  serviceSchema,
  serviceResponseSchema,
} from "../validators/serviceProviderValidators"
import { uploadMultipleFiles } from "../utils/fileUpload"

const router = express.Router()

// All routes are protected
router.use(protect)

// Register as service provider
router.post("/register", validateRequest({ body: serviceProviderProfileSchema }), ServiceProviderController.register)

// Get service provider profile
router.get("/profile", restrictTo("SERVICE_PROVIDER"), ServiceProviderController.getProfile)

// Update service provider profile
router.put(
  "/profile",
  restrictTo("SERVICE_PROVIDER"),
  validateRequest({ body: serviceProviderProfileSchema }),
  ServiceProviderController.updateProfile,
)

// Create a new service
router.post(
  "/services",
  restrictTo("SERVICE_PROVIDER"),
  uploadMultipleFiles,
  validateRequest({ body: serviceSchema }),
  ServiceProviderController.createService,
)

// Get all services
router.get("/services", restrictTo("SERVICE_PROVIDER"), ServiceProviderController.getServices)

// Get service by ID
router.get("/services/:id", restrictTo("SERVICE_PROVIDER"), ServiceProviderController.getServiceById)

// Update service
router.put(
  "/services/:id",
  restrictTo("SERVICE_PROVIDER"),
  uploadMultipleFiles,
  validateRequest({ body: serviceSchema }),
  ServiceProviderController.updateService,
)

// Delete service
router.delete("/services/:id", restrictTo("SERVICE_PROVIDER"), ServiceProviderController.deleteService)

// Get all orders
router.get("/orders", restrictTo("SERVICE_PROVIDER"), ServiceProviderController.getOrders)

// Respond to order
router.post(
  "/respond/:orderId",
  restrictTo("SERVICE_PROVIDER"),
  validateRequest({ body: serviceResponseSchema }),
  ServiceProviderController.respondToOrder,
)

export { router as serviceProviderRoutes }

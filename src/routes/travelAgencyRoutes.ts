import express from "express"
import { TravelAgencyController } from "../controllers/travelAgencyController"
import { protect, restrictTo } from "../middleware/authMiddleware"
import { validateRequest } from "../middleware/validateRequest"
import {
  travelAgencyProfileSchema,
  travelPackageSchema,
  packageResponseSchema,
} from "../validators/travelAgencyValidators"
import { uploadMultipleFiles } from "../utils/fileUpload"

const router = express.Router()

// All routes are protected
router.use(protect)

// Register as travel agency
router.post("/register", validateRequest({ body: travelAgencyProfileSchema }), TravelAgencyController.register)

// Get travel agency profile
router.get("/profile", restrictTo("TRAVEL_AGENCY"), TravelAgencyController.getProfile)

// Update travel agency profile
router.put(
  "/profile",
  restrictTo("TRAVEL_AGENCY"),
  validateRequest({ body: travelAgencyProfileSchema }),
  TravelAgencyController.updateProfile,
)

// Create a new package
router.post(
  "/packages",
  restrictTo("TRAVEL_AGENCY"),
  uploadMultipleFiles,
  validateRequest({ body: travelPackageSchema }),
  TravelAgencyController.createPackage,
)

// Get all packages
router.get("/packages", restrictTo("TRAVEL_AGENCY"), TravelAgencyController.getPackages)

// Get package by ID
router.get("/packages/:id", restrictTo("TRAVEL_AGENCY"), TravelAgencyController.getPackageById)

// Update package
router.put(
  "/packages/:id",
  restrictTo("TRAVEL_AGENCY"),
  uploadMultipleFiles,
  validateRequest({ body: travelPackageSchema }),
  TravelAgencyController.updatePackage,
)

// Delete package
router.delete("/packages/:id", restrictTo("TRAVEL_AGENCY"), TravelAgencyController.deletePackage)

// Get all orders
router.get("/orders", restrictTo("TRAVEL_AGENCY"), TravelAgencyController.getOrders)

// Respond to order
router.post(
  "/respond/:orderId",
  restrictTo("TRAVEL_AGENCY"),
  validateRequest({ body: packageResponseSchema }),
  TravelAgencyController.respondToOrder,
)

export { router as travelAgencyRoutes }

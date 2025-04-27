import express from "express"
import { TripController } from "../controllers/tripController"
import { protect } from "../middleware/authMiddleware"
import { validateRequest } from "../middleware/validateRequest"
import { createTripSchema, updateTripSchema } from "../validators/tripValidators"
import { idParamSchema } from "../validators/commonValidators"

const router = express.Router()

// Public routes
router.get("/", TripController.getAllTrips)
router.get("/search", TripController.searchTrips)
router.get("/:id", validateRequest({ params: idParamSchema }), TripController.getTripById)
router.get("/:id/availability", validateRequest({ params: idParamSchema }), TripController.getTripAvailability)

// Protected routes
router.use(protect)
router.post("/", validateRequest({ body: createTripSchema }), TripController.createTrip)
router.patch("/:id", validateRequest({ params: idParamSchema, body: updateTripSchema }), TripController.updateTrip)
router.delete("/:id", validateRequest({ params: idParamSchema }), TripController.deleteTrip)

export { router as tripRoutes }

import express from "express"
import { TripController } from "../controllers/tripController"
import { protect } from "../middleware/authMiddleware"
import { validateRequest } from "../middleware/validateRequest"
import { createTripSchema, updateTripSchema } from "../validators/tripValidators"

const router = express.Router()

// Public routes
router.get("/", TripController.getTrips)
router.get("/search", TripController.searchTrips)
router.get("/:id", TripController.getTripById)

// Protected routes
router.use(protect)

router.post("/", validateRequest({ body: createTripSchema }), TripController.createTrip)

router.put("/:id", validateRequest({ body: updateTripSchema }), TripController.updateTrip)

router.delete("/:id", TripController.deleteTrip)

export { router as tripRoutes }

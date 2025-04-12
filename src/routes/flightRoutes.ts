import express from "express"
import { FlightController } from "../controllers/flightController"
import { protect, restrictTo } from "../middleware/authMiddleware"
import { validateRequest } from "../middleware/validateRequest"
import { createFlightSchema, updateFlightSchema } from "../validators/flightValidators"

const router = express.Router()

// Public routes
router.get("/", FlightController.getFlights)
router.get("/search", FlightController.searchFlights)
router.get("/:id", FlightController.getFlightById)

// Protected routes
router.use(protect)
router.use(restrictTo("ADMIN", "SERVICE_PROVIDER"))

router.post("/", validateRequest({ body: createFlightSchema }), FlightController.createFlight)

router.put("/:id", validateRequest({ body: updateFlightSchema }), FlightController.updateFlight)

router.delete("/:id", FlightController.deleteFlight)

export { router as flightRoutes }

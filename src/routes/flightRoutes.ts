import express from "express"
import { FlightController } from "../controllers/flightController"
import { protect, restrictTo } from "../middleware/authMiddleware"
import { validateRequest } from "../middleware/validateRequest"
import { createFlightSchema, updateFlightSchema } from "../validators/flightValidators"
import { idParamSchema, paginationQuerySchema } from "../validators/commonValidators"

const router = express.Router()

// Public routes
router.get(
  "/",
  validateRequest({ query: paginationQuerySchema }),
  FlightController.getAllFlights
);
router.get("/search", FlightController.searchFlights)
router.get("/:id", validateRequest({ params: idParamSchema }), FlightController.getFlightById)
router.get("/:id/availability", validateRequest({ params: idParamSchema }), FlightController.getFlightAvailability)

// Protected routes for admins and service providers
router.use(protect)
router.post(
  "/",
  restrictTo("ADMIN", "SERVICE_PROVIDER"),
  validateRequest({ body: createFlightSchema }),
  FlightController.createFlight,
)
router.patch(
  "/:id",
  restrictTo("ADMIN", "SERVICE_PROVIDER"),
  validateRequest({ params: idParamSchema, body: updateFlightSchema }),
  FlightController.updateFlight,
)
router.delete(
  "/:id",
  restrictTo("ADMIN", "SERVICE_PROVIDER"),
  validateRequest({ params: idParamSchema }),
  FlightController.deleteFlight,
)

export { router as flightRoutes }

import express from "express";
import { FlightController } from "../controllers/flightController";
import { protect } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import {
  createFlightSchema,
  updateFlightSchema,
  searchFlightsSchema,
} from "../validators/flightValidators";
import { idParamSchema } from "../validators/commonValidators";

const router = express.Router();

// Public routes
router.get(
  "/",
  validateRequest({ query: searchFlightsSchema }),
  FlightController.getFlights
);

router.get(
  "/search",
  validateRequest({ query: searchFlightsSchema }),
  FlightController.searchFlights
);

router.get(
  "/:id",
  validateRequest({ params: idParamSchema }),
  FlightController.getFlightById
);

router.get(
  "/:id/availability",
  validateRequest({ params: idParamSchema }),
  FlightController.getFlightAvailability
);

// Protected routes
router.use(protect);

router.post(
  "/",
  validateRequest({ body: createFlightSchema }),
  FlightController.createFlight
);

router.patch(
  "/:id",
  validateRequest({
    params: idParamSchema,
    body: updateFlightSchema,
  }),
  FlightController.updateFlight
);

router.delete(
  "/:id",
  validateRequest({ params: idParamSchema }),
  FlightController.deleteFlight
);

export { router as flightRoutes };

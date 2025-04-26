import express from "express";
import { HotelController } from "../controllers/hotelController";
import { protect } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import {
  createHotelSchema,
  updateHotelSchema,
  searchHotelsSchema,
} from "../validators/hotelValidators";
import { idParamSchema } from "../validators/commonValidators";

const router = express.Router();

// Public routes
router.get(
  "/",
  validateRequest({ query: searchHotelsSchema }),
  HotelController.getHotels
);

router.get(
  "/search",
  validateRequest({ query: searchHotelsSchema }),
  HotelController.searchHotels
);

router.get(
  "/:id",
  validateRequest({ params: idParamSchema }),
  HotelController.getHotelById
);

router.get(
  "/:id/availability",
  validateRequest({ params: idParamSchema }),
  HotelController.getHotelAvailability
);

// Protected routes
router.use(protect);

router.post(
  "/",
  validateRequest({ body: createHotelSchema }),
  HotelController.createHotel
);

router.patch(
  "/:id",
  validateRequest({
    params: idParamSchema,
    body: updateHotelSchema,
  }),
  HotelController.updateHotel
);

router.delete(
  "/:id",
  validateRequest({ params: idParamSchema }),
  HotelController.deleteHotel
);

export { router as hotelRoutes };

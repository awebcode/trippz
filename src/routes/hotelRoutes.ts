import express from "express"
import { HotelController } from "../controllers/hotelController"
import { protect, restrictTo } from "../middleware/authMiddleware"
import { validateRequest } from "../middleware/validateRequest"
import { createHotelSchema, updateHotelSchema } from "../validators/hotelValidators"
import { idParamSchema, paginationQuerySchema } from "../validators/commonValidators"

const router = express.Router()

// Public routes
router.get("/", validateRequest({ query: paginationQuerySchema }), HotelController.getAllHotels)
router.get("/search", HotelController.searchHotels)
router.get("/:id", validateRequest({ params: idParamSchema }), HotelController.getHotelById)
router.get("/:id/availability", validateRequest({ params: idParamSchema }), HotelController.getHotelAvailability)

// Protected routes for admins and service providers
router.use(protect)
router.post(
  "/",
  restrictTo("ADMIN", "SERVICE_PROVIDER"),
  validateRequest({ body: createHotelSchema }),
  HotelController.createHotel,
)
router.patch(
  "/:id",
  restrictTo("ADMIN", "SERVICE_PROVIDER"),
  validateRequest({ params: idParamSchema, body: updateHotelSchema }),
  HotelController.updateHotel,
)
router.delete(
  "/:id",
  restrictTo("ADMIN", "SERVICE_PROVIDER"),
  validateRequest({ params: idParamSchema }),
  HotelController.deleteHotel,
)

export { router as hotelRoutes }

import express from "express"
import { BookingController } from "../controllers/bookingController"
import { protect } from "../middleware/authMiddleware"
import { validateRequest } from "../middleware/validateRequest"
import { createBookingSchema, updateBookingSchema, bookingListQuerySchema } from "../validators/bookingValidators"
import { idParamSchema } from "../validators/commonValidators"

const router = express.Router()

// All booking routes require authentication
router.use(protect)

router.post("/", validateRequest({ body: createBookingSchema }), BookingController.createBooking)

router.get("/", validateRequest({ query: bookingListQuerySchema }), BookingController.getBookings)

router.get("/:id", validateRequest({ params: idParamSchema }), BookingController.getBookingById)

router.patch(
  "/:id",
  validateRequest({
    params: idParamSchema,
    body: updateBookingSchema,
  }),
  BookingController.updateBooking,
)

router.post("/:id/cancel", validateRequest({ params: idParamSchema }), BookingController.cancelBooking)

export { router as bookingRoutes }

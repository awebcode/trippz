import express from "express"
import { BookingController } from "../controllers/bookingController"
import { protect } from "../middleware/authMiddleware"
import { validateRequest } from "../middleware/validateRequest"
import { createBookingSchema, updateBookingSchema } from "../validators/bookingValidators"

const router = express.Router()

// All routes are protected
router.use(protect)

router.post("/", validateRequest({ body: createBookingSchema }), BookingController.createBooking)

router.get("/", BookingController.getBookings)

router.get("/:id", BookingController.getBookingById)

router.put("/:id", validateRequest({ body: updateBookingSchema }), BookingController.updateBooking)

router.delete("/:id", BookingController.cancelBooking)

export { router as bookingRoutes }

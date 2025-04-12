import express from "express"
import { HotelController } from "../controllers/hotelController"
import { protect, restrictTo } from "../middleware/authMiddleware"
import { validateRequest } from "../middleware/validateRequest"
import { createHotelSchema, updateHotelSchema } from "../validators/hotelValidators"

const router = express.Router()

// Public routes
router.get("/", HotelController.getHotels)
router.get("/search", HotelController.searchHotels)
router.get("/:id", HotelController.getHotelById)

// Protected routes
router.use(protect)
router.use(restrictTo("ADMIN", "SERVICE_PROVIDER"))

router.post("/", validateRequest({ body: createHotelSchema }), HotelController.createHotel)

router.put("/:id", validateRequest({ body: updateHotelSchema }), HotelController.updateHotel)

router.delete("/:id", HotelController.deleteHotel)

export { router as hotelRoutes }

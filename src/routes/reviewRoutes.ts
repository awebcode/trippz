import express from "express"
import { ReviewController } from "../controllers/reviewController"
import { protect } from "../middleware/authMiddleware"
import { validateRequest } from "../middleware/validateRequest"
import { createReviewSchema, updateReviewSchema } from "../validators/reviewValidators"

const router = express.Router()

// Public routes
router.get("/hotels/:id", ReviewController.getHotelReviews)
router.get("/flights/:id", ReviewController.getFlightReviews)
router.get("/trips/:id", ReviewController.getTripReviews)

// Protected routes
router.use(protect)

router.post("/", validateRequest({ body: createReviewSchema }), ReviewController.createReview)

router.get("/user", ReviewController.getUserReviews)

router.put("/:id", validateRequest({ body: updateReviewSchema }), ReviewController.updateReview)

router.delete("/:id", ReviewController.deleteReview)

export { router as reviewRoutes }

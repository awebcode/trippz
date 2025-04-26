import express from "express"
import { DestinationController } from "../controllers/destinationController"
import { protect, restrictTo } from "../middleware/authMiddleware"
import { validateRequest } from "../middleware/validateRequest"
import { destinationSchema, setFeaturedImageSchema } from "../validators/destinationValidators"
import { idParamSchema } from "../validators/commonValidators"
import { uploadMultipleFiles } from "../utils/fileUpload"

const router = express.Router()

// Public routes
router.get("/", DestinationController.getDestinations)
router.get("/trending", DestinationController.getTrendingDestinations)
router.get("/nearby", DestinationController.getNearbyDestinations)
router.get("/:id", validateRequest({ params: idParamSchema }), DestinationController.getDestinationById)
router.get("/:id/weather", validateRequest({ params: idParamSchema }), DestinationController.getDestinationWeather)
router.get(
  "/:id/attractions",
  validateRequest({ params: idParamSchema }),
  DestinationController.getDestinationAttractions,
)

// Protected routes (admin only)
router.use(protect)
router.use(restrictTo("ADMIN"))

router.post(
  "/",
  uploadMultipleFiles,
  validateRequest({ body: destinationSchema }),
  DestinationController.createDestination,
)

router.put(
  "/:id",
  uploadMultipleFiles,
  validateRequest({
    params: idParamSchema,
    body: destinationSchema,
  }),
  DestinationController.updateDestination,
)

router.delete("/:id", validateRequest({ params: idParamSchema }), DestinationController.deleteDestination)

router.put(
  "/:id/featured-image",
  validateRequest({
    params: idParamSchema,
    body: setFeaturedImageSchema,
  }),
  DestinationController.setFeaturedImage,
)

export { router as destinationRoutes }

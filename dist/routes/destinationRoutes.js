"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.destinationRoutes = void 0;
const express_1 = __importDefault(require("express"));
const destinationController_1 = require("../controllers/destinationController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validateRequest_1 = require("../middleware/validateRequest");
const destinationValidators_1 = require("../validators/destinationValidators");
const commonValidators_1 = require("../validators/commonValidators");
const fileUpload_1 = require("../utils/fileUpload");
const router = express_1.default.Router();
exports.destinationRoutes = router;
// Public routes
router.get("/", destinationController_1.DestinationController.getDestinations);
router.get("/trending", destinationController_1.DestinationController.getTrendingDestinations);
router.get("/nearby", destinationController_1.DestinationController.getNearbyDestinations);
router.get("/:id", (0, validateRequest_1.validateRequest)({ params: commonValidators_1.idParamSchema }), destinationController_1.DestinationController.getDestinationById);
router.get("/:id/weather", (0, validateRequest_1.validateRequest)({ params: commonValidators_1.idParamSchema }), destinationController_1.DestinationController.getDestinationWeather);
router.get("/:id/attractions", (0, validateRequest_1.validateRequest)({ params: commonValidators_1.idParamSchema }), destinationController_1.DestinationController.getDestinationAttractions);
// Protected routes (admin only)
router.use(authMiddleware_1.protect);
router.use((0, authMiddleware_1.restrictTo)("ADMIN"));
router.post("/", fileUpload_1.uploadMultipleFiles, (0, validateRequest_1.validateRequest)({ body: destinationValidators_1.destinationSchema }), destinationController_1.DestinationController.createDestination);
router.put("/:id", fileUpload_1.uploadMultipleFiles, (0, validateRequest_1.validateRequest)({
    params: commonValidators_1.idParamSchema,
    body: destinationValidators_1.destinationSchema,
}), destinationController_1.DestinationController.updateDestination);
router.delete("/:id", (0, validateRequest_1.validateRequest)({ params: commonValidators_1.idParamSchema }), destinationController_1.DestinationController.deleteDestination);
router.put("/:id/featured-image", (0, validateRequest_1.validateRequest)({
    params: commonValidators_1.idParamSchema,
    body: destinationValidators_1.setFeaturedImageSchema,
}), destinationController_1.DestinationController.setFeaturedImage);
//# sourceMappingURL=destinationRoutes.js.map
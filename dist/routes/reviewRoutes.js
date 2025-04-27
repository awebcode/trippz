"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewRoutes = void 0;
const express_1 = __importDefault(require("express"));
const reviewController_1 = require("../controllers/reviewController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validateRequest_1 = require("../middleware/validateRequest");
const reviewValidators_1 = require("../validators/reviewValidators");
const router = express_1.default.Router();
exports.reviewRoutes = router;
// Public routes
router.get("/hotels/:id", reviewController_1.ReviewController.getHotelReviews);
router.get("/flights/:id", reviewController_1.ReviewController.getFlightReviews);
router.get("/trips/:id", reviewController_1.ReviewController.getTripReviews);
// Protected routes
router.use(authMiddleware_1.protect);
router.post("/", (0, validateRequest_1.validateRequest)({ body: reviewValidators_1.createReviewSchema }), reviewController_1.ReviewController.createReview);
router.get("/user", reviewController_1.ReviewController.getUserReviews);
router.put("/:id", (0, validateRequest_1.validateRequest)({ body: reviewValidators_1.updateReviewSchema }), reviewController_1.ReviewController.updateReview);
router.delete("/:id", reviewController_1.ReviewController.deleteReview);
//# sourceMappingURL=reviewRoutes.js.map
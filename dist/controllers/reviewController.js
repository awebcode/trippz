"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const reviewService_1 = require("../services/reviewService");
const catchAsync_1 = require("../utils/catchAsync");
class ReviewController {
}
exports.ReviewController = ReviewController;
_a = ReviewController;
ReviewController.createReview = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const data = req.body;
    const review = await reviewService_1.ReviewService.createReview(userId, data);
    res.status(201).json({
        status: "success",
        data: review,
    });
});
ReviewController.getHotelReviews = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const hotelId = req.params.id;
    const reviews = await reviewService_1.ReviewService.getReviews("hotel", hotelId);
    res.status(200).json({
        status: "success",
        data: reviews,
    });
});
ReviewController.getFlightReviews = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const flightId = req.params.id;
    const reviews = await reviewService_1.ReviewService.getReviews("flight", flightId);
    res.status(200).json({
        status: "success",
        data: reviews,
    });
});
ReviewController.getTripReviews = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const tripId = req.params.id;
    const reviews = await reviewService_1.ReviewService.getReviews("trip", tripId);
    res.status(200).json({
        status: "success",
        data: reviews,
    });
});
ReviewController.getUserReviews = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const reviews = await reviewService_1.ReviewService.getUserReviews(userId);
    res.status(200).json({
        status: "success",
        data: reviews,
    });
});
ReviewController.updateReview = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const reviewId = req.params.id;
    const data = req.body;
    const review = await reviewService_1.ReviewService.updateReview(userId, reviewId, data);
    res.status(200).json({
        status: "success",
        data: review,
    });
});
ReviewController.deleteReview = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const reviewId = req.params.id;
    const result = await reviewService_1.ReviewService.deleteReview(userId, reviewId);
    res.status(200).json({
        status: "success",
        data: result,
    });
});
//# sourceMappingURL=reviewController.js.map
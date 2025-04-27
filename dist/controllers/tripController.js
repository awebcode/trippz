"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripController = void 0;
const tripService_1 = require("../services/tripService");
const catchAsync_1 = require("../utils/catchAsync");
const appError_1 = require("../utils/appError");
class TripController {
}
exports.TripController = TripController;
_a = TripController;
TripController.getAllTrips = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const trips = await tripService_1.TripService.getTrips(req.validatedQuery);
    res.status(200).json({
        success: true,
        data: trips.data,
        metadata: trips.metadata,
    });
});
TripController.getTripById = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const tripId = req.params.id;
    const trip = await tripService_1.TripService.getTripById(tripId);
    if (!trip) {
        return next(new appError_1.AppError("Trip not found", 404));
    }
    res.status(200).json({
        success: true,
        data: trip,
    });
});
TripController.createTrip = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const tripData = { ...req.body };
    const trip = await tripService_1.TripService.createTrip(userId, tripData);
    res.status(201).json({
        success: true,
        message: "Trip created successfully",
        data: trip,
    });
});
TripController.updateTrip = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const tripId = req.params.id;
    const userId = req.currentUser.id;
    const tripData = req.body;
    // Check if the trip belongs to the user or user is admin
    const trip = await tripService_1.TripService.getTripById(tripId);
    if (!trip) {
        return next(new appError_1.AppError("Trip not found", 404));
    }
    if (trip.user_id !== userId && req.currentUser.role !== "ADMIN") {
        return next(new appError_1.AppError("You are not authorized to update this trip", 403));
    }
    const updatedTrip = await tripService_1.TripService.updateTrip(userId, tripId, tripData);
    res.status(200).json({
        success: true,
        message: "Trip updated successfully",
        data: updatedTrip,
    });
});
TripController.deleteTrip = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const tripId = req.params.id;
    const userId = req.currentUser.id;
    // Check if the trip belongs to the user or user is admin
    const trip = await tripService_1.TripService.getTripById(tripId);
    if (!trip) {
        return next(new appError_1.AppError("Trip not found", 404));
    }
    if (trip.user_id !== userId && req.currentUser.role !== "ADMIN") {
        return next(new appError_1.AppError("You are not authorized to delete this trip", 403));
    }
    await tripService_1.TripService.deleteTrip(userId, tripId);
    res.status(200).json({
        success: true,
        message: "Trip deleted successfully",
    });
});
TripController.searchTrips = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const trips = await tripService_1.TripService.searchTrips(req.validatedQuery);
    res.status(200).json({
        success: true,
        data: trips.data,
        metadata: trips.metadata,
    });
});
TripController.getTripAvailability = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const availability = await tripService_1.TripService.getTripAvailability(req.validatedQuery);
    res.status(200).json({
        success: true,
        data: availability,
    });
});
//# sourceMappingURL=tripController.js.map
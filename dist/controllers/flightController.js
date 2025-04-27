"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlightController = void 0;
const flightService_1 = require("../services/flightService");
const catchAsync_1 = require("../utils/catchAsync");
const appError_1 = require("../utils/appError");
class FlightController {
}
exports.FlightController = FlightController;
_a = FlightController;
FlightController.getAllFlights = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const flights = await flightService_1.FlightService.getFlights(req.validatedQuery);
    res.status(200).json({
        success: true,
        data: flights.data,
        metadata: flights.metadata,
    });
});
FlightController.getFlightById = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const flightId = req.params.id;
    const flight = await flightService_1.FlightService.getFlightById(flightId);
    if (!flight) {
        return next(new appError_1.AppError("Flight not found", 404));
    }
    res.status(200).json({
        success: true,
        data: flight,
    });
});
FlightController.createFlight = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const flightData = req.body;
    const flight = await flightService_1.FlightService.createFlight(flightData);
    res.status(201).json({
        success: true,
        message: "Flight created successfully",
        data: flight,
    });
});
FlightController.updateFlight = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const flightId = req.params.id;
    const flightData = req.body;
    const flight = await flightService_1.FlightService.updateFlight(flightId, flightData);
    res.status(200).json({
        success: true,
        message: "Flight updated successfully",
        data: flight,
    });
});
FlightController.deleteFlight = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const flightId = req.params.id;
    await flightService_1.FlightService.deleteFlight(flightId);
    res.status(200).json({
        success: true,
        message: "Flight deleted successfully",
    });
});
FlightController.searchFlights = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const flights = await flightService_1.FlightService.searchFlights(req.validatedQuery);
    res.status(200).json({
        success: true,
        data: flights.data,
        metadata: flights.metadata,
    });
});
FlightController.getFlightAvailability = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const availability = await flightService_1.FlightService.getFlightAvailability(req.validatedQuery);
    res.status(200).json({
        success: true,
        data: availability,
    });
});
//# sourceMappingURL=flightController.js.map
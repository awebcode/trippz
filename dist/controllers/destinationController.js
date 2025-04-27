"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DestinationController = void 0;
const destinationService_1 = require("../services/destinationService");
const catchAsync_1 = require("../utils/catchAsync");
class DestinationController {
}
exports.DestinationController = DestinationController;
_a = DestinationController;
DestinationController.createDestination = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const data = req.body;
    const files = req.files;
    const destination = await destinationService_1.DestinationService.createDestination(data, files);
    res.status(201).json({
        success: true,
        message: "Destination created successfully",
        data: destination,
    });
});
DestinationController.getDestinations = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const result = await destinationService_1.DestinationService.getDestinations(req.query);
    res.status(200).json({
        success: true,
        data: result.data,
        metadata: result.metadata,
    });
});
DestinationController.getDestinationById = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const destinationId = req.params.id;
    const destination = await destinationService_1.DestinationService.getDestinationById(destinationId);
    res.status(200).json({
        success: true,
        data: destination,
    });
});
DestinationController.updateDestination = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const destinationId = req.params.id;
    const data = req.body;
    const files = req.files;
    const updatedDestination = await destinationService_1.DestinationService.updateDestination(destinationId, data, files);
    res.status(200).json({
        success: true,
        message: "Destination updated successfully",
        data: updatedDestination,
    });
});
DestinationController.deleteDestination = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const destinationId = req.params.id;
    const result = await destinationService_1.DestinationService.deleteDestination(destinationId);
    res.status(200).json({
        success: true,
        message: result.message,
    });
});
DestinationController.setFeaturedImage = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const destinationId = req.params.id;
    const { imageId } = req.body;
    const result = await destinationService_1.DestinationService.setFeaturedImage(destinationId, imageId);
    res.status(200).json({
        success: true,
        message: result.message,
    });
});
DestinationController.getTrendingDestinations = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const limit = Number.parseInt(req.query.limit) || 5;
    const destinations = await destinationService_1.DestinationService.getTrendingDestinations(limit);
    res.status(200).json({
        success: true,
        data: destinations,
    });
});
DestinationController.getNearbyDestinations = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { latitude, longitude, radius, limit } = req.query;
    const destinations = await destinationService_1.DestinationService.getNearbyDestinations(Number.parseFloat(latitude), Number.parseFloat(longitude), Number.parseInt(radius) || 100, Number.parseInt(limit) || 5);
    res.status(200).json({
        success: true,
        data: destinations,
    });
});
DestinationController.getDestinationWeather = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const destinationId = req.params.id;
    const weather = await destinationService_1.DestinationService.getDestinationWeather(destinationId);
    res.status(200).json({
        success: true,
        data: weather,
    });
});
DestinationController.getDestinationAttractions = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const destinationId = req.params.id;
    const limit = Number.parseInt(req.query.limit) || 10;
    const attractions = await destinationService_1.DestinationService.getDestinationAttractions(destinationId, limit);
    res.status(200).json({
        success: true,
        data: attractions,
    });
});
//# sourceMappingURL=destinationController.js.map
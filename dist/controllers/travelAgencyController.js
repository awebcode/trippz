"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TravelAgencyController = void 0;
const travelAgencyService_1 = require("../services/travelAgencyService");
const catchAsync_1 = require("../utils/catchAsync");
class TravelAgencyController {
}
exports.TravelAgencyController = TravelAgencyController;
_a = TravelAgencyController;
TravelAgencyController.register = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const data = req.body;
    const travelAgency = await travelAgencyService_1.TravelAgencyService.register(userId, data);
    res.status(201).json({
        success: true,
        message: "Registered as travel agency successfully",
        data: travelAgency,
    });
});
TravelAgencyController.getProfile = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const profile = await travelAgencyService_1.TravelAgencyService.getProfile(userId);
    res.status(200).json({
        success: true,
        data: profile,
    });
});
TravelAgencyController.updateProfile = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const data = req.body;
    const updatedProfile = await travelAgencyService_1.TravelAgencyService.updateProfile(userId, data);
    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updatedProfile,
    });
});
TravelAgencyController.createPackage = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const data = req.body;
    const files = req.files;
    const travelPackage = await travelAgencyService_1.TravelAgencyService.createPackage(userId, data, files);
    res.status(201).json({
        success: true,
        message: "Travel package created successfully",
        data: travelPackage,
    });
});
TravelAgencyController.getPackages = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const packages = await travelAgencyService_1.TravelAgencyService.getPackages(userId);
    res.status(200).json({
        success: true,
        data: packages,
    });
});
TravelAgencyController.getPackageById = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const packageId = req.params.id;
    const travelPackage = await travelAgencyService_1.TravelAgencyService.getPackageById(packageId);
    res.status(200).json({
        success: true,
        data: travelPackage,
    });
});
TravelAgencyController.updatePackage = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const packageId = req.params.id;
    const data = req.body;
    const files = req.files;
    const updatedPackage = await travelAgencyService_1.TravelAgencyService.updatePackage(userId, packageId, data, files);
    res.status(200).json({
        success: true,
        message: "Travel package updated successfully",
        data: updatedPackage,
    });
});
TravelAgencyController.deletePackage = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const packageId = req.params.id;
    const result = await travelAgencyService_1.TravelAgencyService.deletePackage(userId, packageId);
    res.status(200).json({
        success: true,
        message: result.message,
    });
});
TravelAgencyController.getOrders = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const orders = await travelAgencyService_1.TravelAgencyService.getOrders(userId);
    res.status(200).json({
        success: true,
        data: orders,
    });
});
TravelAgencyController.respondToOrder = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const orderId = req.params.orderId;
    const data = req.body;
    const updatedOrder = await travelAgencyService_1.TravelAgencyService.respondToOrder(userId, orderId, data.agency_response);
    res.status(200).json({
        success: true,
        message: "Response sent successfully",
        data: updatedOrder,
    });
});
//# sourceMappingURL=travelAgencyController.js.map
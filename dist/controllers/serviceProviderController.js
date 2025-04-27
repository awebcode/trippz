"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceProviderController = void 0;
const serviceProviderService_1 = require("../services/serviceProviderService");
const catchAsync_1 = require("../utils/catchAsync");
class ServiceProviderController {
}
exports.ServiceProviderController = ServiceProviderController;
_a = ServiceProviderController;
ServiceProviderController.register = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const data = req.body;
    const serviceProvider = await serviceProviderService_1.ServiceProviderService.register(userId, data);
    res.status(201).json({
        success: true,
        message: "Registered as service provider successfully",
        data: serviceProvider,
    });
});
ServiceProviderController.getProfile = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const profile = await serviceProviderService_1.ServiceProviderService.getProfile(userId);
    res.status(200).json({
        success: true,
        data: profile,
    });
});
ServiceProviderController.updateProfile = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const data = req.body;
    const updatedProfile = await serviceProviderService_1.ServiceProviderService.updateProfile(userId, data);
    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updatedProfile,
    });
});
ServiceProviderController.createService = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const data = req.body;
    const files = req.files;
    const service = await serviceProviderService_1.ServiceProviderService.createService(userId, data, files);
    res.status(201).json({
        success: true,
        message: "Service created successfully",
        data: service,
    });
});
ServiceProviderController.getServices = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const services = await serviceProviderService_1.ServiceProviderService.getServices(userId);
    res.status(200).json({
        success: true,
        data: services,
    });
});
ServiceProviderController.getServiceById = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const serviceId = req.params.id;
    const service = await serviceProviderService_1.ServiceProviderService.getServiceById(serviceId);
    res.status(200).json({
        success: true,
        data: service,
    });
});
ServiceProviderController.updateService = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const serviceId = req.params.id;
    const data = req.body;
    const files = req.files;
    const updatedService = await serviceProviderService_1.ServiceProviderService.updateService(userId, serviceId, data, files);
    res.status(200).json({
        success: true,
        message: "Service updated successfully",
        data: updatedService,
    });
});
ServiceProviderController.deleteService = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const serviceId = req.params.id;
    const result = await serviceProviderService_1.ServiceProviderService.deleteService(userId, serviceId);
    res.status(200).json({
        success: true,
        message: result.message,
    });
});
ServiceProviderController.getOrders = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const orders = await serviceProviderService_1.ServiceProviderService.getOrders(userId);
    res.status(200).json({
        success: true,
        data: orders,
    });
});
ServiceProviderController.respondToOrder = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const orderId = req.params.orderId;
    const data = req.body;
    const updatedOrder = await serviceProviderService_1.ServiceProviderService.respondToOrder(userId, orderId, data.provider_response);
    res.status(200).json({
        success: true,
        message: "Response sent successfully",
        data: updatedOrder,
    });
});
//# sourceMappingURL=serviceProviderController.js.map
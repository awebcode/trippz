"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const adminService_1 = require("../services/adminService");
const catchAsync_1 = require("../utils/catchAsync");
class AdminController {
}
exports.AdminController = AdminController;
_a = AdminController;
// User Management
AdminController.getUsers = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const query = req.validatedQuery;
    const users = await adminService_1.AdminService.getUsers(query);
    res.status(200).json({
        success: true,
        data: users.data,
        metadata: users.metadata,
    });
});
AdminController.getUserById = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.params.id;
    const user = await adminService_1.AdminService.getUserById(userId);
    res.status(200).json({
        success: true,
        data: user,
    });
});
AdminController.updateUserRole = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.params.id;
    const { role } = req.body;
    const updatedUser = await adminService_1.AdminService.updateUserRole(userId, role);
    res.status(200).json({
        success: true,
        message: "User role updated successfully",
        data: updatedUser,
    });
});
AdminController.deleteUser = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.params.id;
    const result = await adminService_1.AdminService.deleteUser(userId);
    res.status(200).json({
        success: true,
        message: result.message,
    });
});
// Dashboard Analytics
AdminController.getStats = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const stats = await adminService_1.AdminService.getStats();
    res.status(200).json({
        success: true,
        data: stats,
    });
});
AdminController.getAnalytics = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const query = req.validatedQuery;
    const analytics = await adminService_1.AdminService.getAnalytics(query);
    res.status(200).json({
        success: true,
        data: analytics,
    });
});
// System Settings
AdminController.getSystemSettings = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const settings = await adminService_1.AdminService.getSystemSettings();
    res.status(200).json({
        success: true,
        data: settings,
    });
});
AdminController.updateSystemSettings = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const data = req.body;
    const settings = await adminService_1.AdminService.updateSystemSettings(data);
    res.status(200).json({
        success: true,
        message: "System settings updated successfully",
        data: settings,
    });
});
// Content Management
AdminController.getAllDestinations = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const query = req.query;
    const destinations = await adminService_1.AdminService.getAllDestinations(query);
    res.status(200).json({
        success: true,
        data: destinations.data,
        metadata: destinations.metadata,
    });
});
//# sourceMappingURL=adminController.js.map
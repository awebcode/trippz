"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const userService_1 = require("../services/userService");
const catchAsync_1 = require("../utils/catchAsync");
class UserController {
}
exports.UserController = UserController;
_a = UserController;
UserController.getProfile = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const profile = await userService_1.UserService.getProfile(userId);
    res.status(200).json({
        status: "success",
        data: profile,
    });
});
UserController.updateProfile = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const data = req.body;
    const updatedProfile = await userService_1.UserService.updateProfile(userId, data);
    res.status(200).json({
        status: "success",
        data: updatedProfile,
    });
});
UserController.updatePassword = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const data = req.body;
    const result = await userService_1.UserService.updatePassword(userId, data);
    res.status(200).json({
        status: "success",
        data: result,
    });
});
UserController.uploadProfilePicture = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    if (!req.file) {
        return res.status(400).json({
            status: "error",
            message: "No file uploaded",
        });
    }
    const result = await userService_1.UserService.uploadProfilePicture(userId, req.file);
    res.status(200).json({
        status: "success",
        data: result,
    });
});
UserController.addAddress = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const data = req.body;
    const address = await userService_1.UserService.addAddress(userId, data);
    res.status(201).json({
        status: "success",
        data: address,
    });
});
UserController.getAddresses = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const addresses = await userService_1.UserService.getAddresses(userId);
    res.status(200).json({
        status: "success",
        data: addresses,
    });
});
UserController.deleteAddress = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const addressId = req.params.id;
    const result = await userService_1.UserService.deleteAddress(userId, addressId);
    res.status(200).json({
        status: "success",
        data: result,
    });
});
//# sourceMappingURL=userController.js.map
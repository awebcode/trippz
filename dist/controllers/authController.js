"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
const catchAsync_1 = require("../utils/catchAsync");
const appError_1 = require("../utils/appError");
const config_1 = require("../config");
class AuthController {
}
exports.AuthController = AuthController;
_a = AuthController;
AuthController.register = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const data = req.body;
    const result = await authService_1.AuthService.register(data);
    // Set cookies if enabled
    if (config_1.config.auth.useCookieAuth === true) {
        await authService_1.AuthService.setAuthCookies(res, result.accessToken, result.refreshToken);
    }
    res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
            user: result.user,
            ...(config_1.config.auth.useCookieAuth !== true && {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            }),
        },
    });
});
AuthController.login = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const data = req.body;
    const result = await authService_1.AuthService.login(data);
    // Set cookies if enabled
    if (config_1.config.auth.useCookieAuth === true) {
        await authService_1.AuthService.setAuthCookies(res, result.accessToken, result.refreshToken);
    }
    res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
            user: result.user,
            ...(config_1.config.auth.useCookieAuth !== true && {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            }),
        },
    });
});
AuthController.forgotPassword = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const data = req.body;
    const result = await authService_1.AuthService.forgotPassword(data);
    res.status(200).json({
        success: true,
        message: result.message,
    });
});
AuthController.resetPassword = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const data = req.body;
    const result = await authService_1.AuthService.resetPassword(data);
    res.status(200).json({
        success: true,
        message: result.message,
    });
});
AuthController.verifyEmail = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const data = req.body;
    const result = await authService_1.AuthService.verifyEmail(data.token);
    res.status(200).json({
        success: true,
        message: result.message,
    });
});
AuthController.verifyPhone = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    if (!req.user) {
        return next(new appError_1.AppError("You must be logged in to verify your phone number", 401));
    }
    const data = req.body;
    const result = await authService_1.AuthService.verifyPhone(data.code, req.currentUser.id);
    res.status(200).json({
        success: true,
        message: result.message,
    });
});
AuthController.socialLogin = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const data = req.body;
    const result = await authService_1.AuthService.socialLogin(data);
    // Set cookies if enabled
    if (config_1.config.auth.useCookieAuth === true) {
        await authService_1.AuthService.setAuthCookies(res, result.accessToken, result.refreshToken);
    }
    res.status(200).json({
        success: true,
        message: "Social login successful",
        data: {
            user: result.user,
            ...(config_1.config.auth.useCookieAuth !== true && {
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            }),
        },
    });
});
AuthController.logout = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    if (!req.user || !req.sessionId) {
        return next(new appError_1.AppError("Not logged in", 401));
    }
    await authService_1.AuthService.logoutCurrentSession(req.currentUser.id, req.sessionId);
    await authService_1.AuthService.clearAuthCookies(res);
    res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
});
AuthController.logoutOtherDevices = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    if (!req.user || !req.sessionId) {
        return next(new appError_1.AppError("Not logged in", 401));
    }
    await authService_1.AuthService.logoutOtherDevices(req.currentUser.id, req.sessionId);
    res.status(200).json({
        success: true,
        message: "Logged out from other devices successfully",
    });
});
AuthController.logoutAllDevices = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    if (!req.user) {
        return next(new appError_1.AppError("Not logged in", 401));
    }
    await authService_1.AuthService.logoutAllDevices(req.currentUser.id);
    await authService_1.AuthService.clearAuthCookies(res);
    res.status(200).json({
        success: true,
        message: "Logged out from all devices successfully",
    });
});
AuthController.refreshToken = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
    if (!refreshToken) {
        return next(new appError_1.AppError("Refresh token is required", 400));
    }
    if (!req.user || !req.sessionId) {
        return next(new appError_1.AppError("Not logged in", 401));
    }
    const tokens = await authService_1.AuthService.generateTokensForUser(req?.user.id, req.sessionId);
    if (config_1.config.auth.useCookieAuth === true) {
        await authService_1.AuthService.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    }
    res.status(200).json({
        success: true,
        message: "Tokens refreshed successfully",
        data: {
            ...(config_1.config.auth.useCookieAuth !== true && {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            }),
        },
    });
});
AuthController.socialAuthCallback = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    if (!req.user || !req.sessionId) {
        return next(new appError_1.AppError("Authentication failed", 401));
    }
    const { accessToken, refreshToken } = await authService_1.AuthService.generateTokensForUser(req.currentUser.id, req.sessionId);
    if (config_1.config.auth.useCookieAuth === true) {
        await authService_1.AuthService.setAuthCookies(res, accessToken, refreshToken);
        return res.redirect(`${process.env.FRONTEND_URL}/auth/success`);
    }
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?accessToken=${accessToken}&refreshToken=${refreshToken}`);
});
//# sourceMappingURL=authController.js.map
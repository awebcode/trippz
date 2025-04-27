"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maintenanceMiddleware = void 0;
const prisma_1 = require("../lib/prisma");
const appError_1 = require("../utils/appError");
const maintenanceMiddleware = async (req, res, next) => {
    try {
        // Skip maintenance check for admin routes and the maintenance status endpoint
        if (req.path.startsWith("/admin") || req.path === "/health" || req.path === "/maintenance-status") {
            return next();
        }
        // Get system settings
        const settings = await prisma_1.prisma.systemSetting.findFirst();
        // If maintenance mode is enabled, return 503 Service Unavailable
        if (settings?.maintenance_mode) {
            throw new appError_1.AppError("System is currently under maintenance. Please try again later.", 503);
        }
        next();
    }
    catch (error) {
        if (error instanceof appError_1.AppError) {
            return next(error);
        }
        next(new appError_1.AppError("Failed to check maintenance status", 500));
    }
};
exports.maintenanceMiddleware = maintenanceMiddleware;
//# sourceMappingURL=maintenanceMiddleware.js.map
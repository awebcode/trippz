"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const appError_1 = require("../utils/appError");
const zod_1 = require("zod");
const errorHandler = (err, req, res, next) => {
    logger_1.logger.error(`Error: ${err.message}`);
    logger_1.logger.error(err.stack || "No stack trace available");
    // Default error response
    const errorResponse = {
        success: false,
        message: "Something went wrong",
        errors: [],
        statusCode: 500,
    };
    // Handle Zod validation errors
    if (err instanceof zod_1.ZodError) {
        errorResponse.statusCode = 400;
        errorResponse.message = "Validation failed";
        errorResponse.errors = err.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
        }));
        res.status(400).json(errorResponse);
        return;
    }
    // Handle custom AppError
    if (err instanceof appError_1.AppError) {
        errorResponse.statusCode = err.statusCode;
        errorResponse.message = err.message;
        if (err.errors && err.errors.length > 0) {
            errorResponse.errors = err.errors;
        }
        res.status(err.statusCode).json({
            ...errorResponse,
            ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
        });
        return;
    }
    // Handle other errors
    if (err instanceof Error) {
        errorResponse.message = err.message || "Internal server error";
        // Include stack trace in development
        if (process.env.NODE_ENV === "development") {
            res.status(500).json({
                ...errorResponse,
                stack: err.stack,
            });
            return;
        }
    }
    // Return generic error response
    res.status(errorResponse.statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map
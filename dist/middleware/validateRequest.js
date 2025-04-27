"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const logger_1 = require("../utils/logger");
const appError_1 = require("../utils/appError");
const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            const validationErrors = [];
            // Validate body
            if (schema.body) {
                try {
                    req.body = await schema.body.parseAsync(req.body);
                }
                catch (error) {
                    if (error instanceof zod_1.ZodError) {
                        error.errors.forEach((err) => {
                            validationErrors.push({
                                path: `body.${err.path.join(".")}`,
                                message: err.message,
                            });
                        });
                    }
                }
            }
            // Validate query
            if (schema.query) {
                try {
                    const parsedQuery = await schema.query.parseAsync(req.query);
                    req.validatedQuery = parsedQuery; // Store validated query
                    req.query = parsedQuery;
                }
                catch (error) {
                    if (error instanceof zod_1.ZodError) {
                        error.errors.forEach((err) => {
                            validationErrors.push({
                                path: `query.${err.path.join(".")}`,
                                message: err.message,
                            });
                        });
                    }
                }
            }
            // Validate params
            if (schema.params) {
                try {
                    req.params = await schema.params.parseAsync(req.params);
                }
                catch (error) {
                    if (error instanceof zod_1.ZodError) {
                        error.errors.forEach((err) => {
                            validationErrors.push({
                                path: `params.${err.path.join(".")}`,
                                message: err.message,
                            });
                        });
                    }
                }
            }
            // If there are validation errors, throw an AppError
            if (validationErrors.length > 0) {
                logger_1.logger.error(`Validation error: ${JSON.stringify(validationErrors)}`);
                throw new appError_1.AppError("Validation failed", 400, validationErrors);
            }
            next();
        }
        catch (error) {
            if (error instanceof appError_1.AppError) {
                return next(error);
            }
            logger_1.logger.error(`Unexpected validation error: ${error}`);
            next(new appError_1.AppError("An error occurred during validation", 500));
        }
    };
};
exports.validateRequest = validateRequest;
//# sourceMappingURL=validateRequest.js.map
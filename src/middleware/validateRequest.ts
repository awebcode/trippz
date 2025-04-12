import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";
import { AppError } from "../utils/appError";

import type { AnyZodObject, ZodEffects, ZodError } from "zod";

// Change from AnyZodObject to accept ZodObject or ZodEffects
export const validateRequest = (schema: {
  body?: ZodEffects<any, any> | AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Create a validation object for each part of the request
      const toValidate: { [key: string]: any } = {};

      if (schema.body) toValidate.body = req.body;
      if (schema.query) toValidate.query = req.query;
      if (schema.params) toValidate.params = req.params;

      // Validate each part
      const validationPromises: Promise<any>[] = [];
      const validationErrors: { path: string; message: string }[] = [];

      if (schema.body) {
        validationPromises.push(
          schema.body
            .parseAsync(req.body)
            .then((data) => {
              req.body = data;
            })
            .catch((error: ZodError) => {
              error.errors.forEach((err) => {
                validationErrors.push({
                  path: `body.${err.path.join(".")}`,
                  message: err.message,
                });
              });
            })
        );
      }

      if (schema.query) {
        validationPromises.push(
          schema.query
            .parseAsync(req.query)
            .then((data) => {
              req.query = data;
            })
            .catch((error: ZodError) => {
              error.errors.forEach((err) => {
                validationErrors.push({
                  path: `query.${err.path.join(".")}`,
                  message: err.message,
                });
              });
            })
        );
      }

      if (schema.params) {
        validationPromises.push(
          schema.params
            .parseAsync(req.params)
            .then((data) => {
              req.params = data;
            })
            .catch((error: ZodError) => {
              error.errors.forEach((err) => {
                validationErrors.push({
                  path: `params.${err.path.join(".")}`,
                  message: err.message,
                });
              });
            })
        );
      }

      // Wait for all validations to complete
      await Promise.all(validationPromises);

      // If there are validation errors, throw an AppError
      if (validationErrors.length > 0) {
        logger.error(`Validation error: ${JSON.stringify(validationErrors)}`);
        throw new AppError("Validation failed", 400, validationErrors);
      }

      next();
    } catch (error) {
      // If it's already an AppError, pass it along
      if (error instanceof AppError) {
        return next(error);
      }

      // For other errors, create a generic error
      logger.error(`Unexpected validation error: ${error}`);
      next(new AppError("An error occurred during validation", 500));
    }
  };
};

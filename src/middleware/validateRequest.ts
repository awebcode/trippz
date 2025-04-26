import type { Request, Response, NextFunction } from "express";
import { ZodError, type AnyZodObject, type ZodType } from "zod";
import { logger } from "../utils/logger";
import { AppError } from "../utils/appError";

// Extend the Request interface to include validated data
interface ValidatedRequest<TQuery = any, TBody = any, TParams = any> extends Request {
  validatedQuery?: TQuery;
  validatedBody?: TBody;
  validatedParams?: TParams;
}

export const validateRequest = <TBody, TQuery, TParams>(schema: {
  body?: AnyZodObject | ZodType;
  query?: AnyZodObject | ZodType;
  params?: AnyZodObject | ZodType;
}) => {
  return async (
    req: ValidatedRequest<TQuery, TBody, TParams>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validationErrors: { path: string; message: string }[] = [];

      // Validate body
      if (schema.body) {
        try {
          req.body = await schema.body.parseAsync(req.body);
        } catch (error) {
          if (error instanceof ZodError) {
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
        } catch (error) {
          if (error instanceof ZodError) {
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
        } catch (error) {
          if (error instanceof ZodError) {
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
        logger.error(`Validation error: ${JSON.stringify(validationErrors)}`);
        throw new AppError("Validation failed", 400, validationErrors);
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        return next(error);
      }
      logger.error(`Unexpected validation error: ${error}`);
      next(new AppError("An error occurred during validation", 500));
    }
  };
};

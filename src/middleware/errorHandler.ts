import type { Request, Response, NextFunction } from "express"
import { logger } from "../utils/logger"
import { AppError } from "../utils/appError"
import { ZodError } from "zod"

export const errorHandler = (
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  logger.error(`Error: ${err.message}`)
  logger.error(err.stack || "No stack trace available")

  // Default error response
  const errorResponse = {
    success: false,
    message: "Something went wrong",
    errors: [] as { path: string; message: string }[],
    statusCode: 500,
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    errorResponse.statusCode = 400
    errorResponse.message = "Validation failed"
    errorResponse.errors = err.errors.map((e) => ({
      path: e.path.join("."),
      message: e.message,
    }))
    res.status(400).json(errorResponse)
    return
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    errorResponse.statusCode = err.statusCode
    errorResponse.message = err.message

    if (err.errors && err.errors.length > 0) {
      errorResponse.errors = err.errors
    }

    res.status(err.statusCode).json({
      ...errorResponse,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    })
    return
  }

  // Handle other errors
  if (err instanceof Error) {
    errorResponse.message = err.message || "Internal server error"

    // Include stack trace in development
    if (process.env.NODE_ENV === "development") {
      res.status(500).json({
        ...errorResponse,
        stack: err.stack,
      })
      return
    }
  }

  // Return generic error response
  res.status(errorResponse.statusCode).json(errorResponse)
}

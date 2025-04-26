import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";
import { logger } from "../utils/logger";
import { AuthService } from "../services/authService";
import { config } from "../config";



declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        email: string;
        first_name: string;
      };
      sessionId?: string;
      validatedQuery?: any;
    }
  }
}

// Cookie options
export const getCookieOptions = (expires?: number) => {
  const isProduction = config.server.nodeEnv === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("strict" as const) : ("lax" as const),
    maxAge: expires || 30 * 24 * 60 * 60 * 1000, // 30 days
    path: "/",
  };
};

/**
 * Auth Middleware
 * - Verifies access token from cookies or Authorization header
 * - Refreshes tokens if access token is expired using refresh token
 * - Validates session in DB
 * - Attaches user and session info to req
 */
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1) Get token from authorization header or cookies
    let accessToken: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer") &&
      req.headers.authorization.split(" ")[1].startsWith("ey")
    ) {
      accessToken = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      accessToken = req.cookies.accessToken;
    }

    const refreshToken = req.cookies?.refreshToken;

    // Early exit if no tokens are provided
    if (!accessToken && !refreshToken) {
      return next(
        new AppError("Authentication Failed, Please login and try again.", 401)
      );
    }

    try {
      // 2) Try verifying access token
      if (accessToken) {
        try {
          const decoded = await AuthService.VerifyJwtToken(accessToken, config.jwt.secret);

          // Validate session
          const session = await AuthService.validateSession(
            decoded.id,
            decoded.session_id
          );

          // Fetch user
          const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, role: true, email: true, first_name: true },
          });

          if (!user) {
            return next(
              new AppError("The user belonging to this token no longer exists.", 401)
            );
          }

          // Attach user and session info to request
          req.user = user;
          req.sessionId = session.id;
          return next();
        } catch (error) {
          if (error instanceof AppError && error.message !== "Token expired") {
            return next(error);
          }
          // If token expired, proceed to refresh logic
        }
      }

      // 3) Handle refresh token if access token is missing or expired
      if (!refreshToken) {
        return next(new AppError("Refresh token required", 400));
      }

      // Verify the new access token
      const decoded = await AuthService.VerifyJwtToken(refreshToken, config.jwt.secret);

      const session = await AuthService.validateSession(decoded.id, decoded.session_id);

      // Fetch user
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, role: true, email: true, first_name: true },
      });
      if (!user) {
        return next(
          new AppError("The user belonging to this token no longer exists.", 401)
        );
      }

      const newPayload = {
        id: decoded.id,
        first_name: user.first_name,
        role: decoded.role,
        email: user.email,
        session_id: session.id,
      };

      const newAccessToken = await AuthService.generateAccessToken(
        newPayload,
      );

      const newRefreshToken = await AuthService.generateRefreshToken(
        newPayload,
      );

      // Set new cookies
      await AuthService.setAuthCookies(res, newAccessToken, newRefreshToken);

      // Validate session

      if (!user) {
        return next(
          new AppError("The user belonging to this token no longer exists.", 401)
        );
      }

      // Attach user and session info to request
      req.user = user;
      req.sessionId = session.id;
      return next();
    } catch (error) {
      logger.error(`Error refreshing token: ${error}`);
      return next(new AppError("Your session has expired. Please log in again.", 401));
    }
  } catch (error) {
    logger.error(`Authentication error: ${error}`);
    return next(
      error instanceof AppError ? error : new AppError("Authentication failed", 401)
    );
  }
};

/**
 * Restrict to specific roles
 */
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("You are not logged in.", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action.", 403)
      );
    }

    next();
  };
};

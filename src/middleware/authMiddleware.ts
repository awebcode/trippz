import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";
import { logger } from "../utils/logger";
import { AuthService } from "../services/authService";
import { config } from "../config";

declare global {
  namespace Express {
    interface Request {
      currentUser: {
        id: string;
        role: string;
        email: string;
        first_name: string;
      };
      sessionId?: string;
      validatedQuery?: any;
      user?: any; // For backward compatibility
    }
  }
}

// Cookie options
export const getCookieOptions = (expires?: number) => {
  const maxAge = expires || 30 * 24 * 60 * 60 * 1000;
  console.log("Cookie maxAge:", maxAge);
  const isProduction = config.server.nodeEnv === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("strict" as const) : ("lax" as const),
    maxAge,
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
    // 1) Try getting tokens from custom headers
    let accessToken = req.headers["x-trippz-access-token"] as string | undefined;
    let refreshToken = req.headers["x-trippz-refresh-token"] as string | undefined;
    if (
      config.auth.useCookieAuth!==true &&
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer") &&
      req.headers.authorization.split(" ")[1].startsWith("ey")
    ) {
      return next(
        new AppError("Use X-TRIPPZ headers only, not Authorization header.", 400)
      );
    }

    // 2) Fallback: Try getting tokens from cookies if headers are missing
    if (!accessToken && req.cookies?.accessToken) {
      accessToken = req.cookies.accessToken;
    }
    if (!refreshToken && req.cookies?.refreshToken) {
      refreshToken = req.cookies.refreshToken;
    }

    if (!accessToken && !refreshToken) {
      return next(new AppError("Authentication required. Please login.", 401));
    }

    // 3) Try verifying access token
    if (accessToken) {
      try {
        const decoded = await AuthService.VerifyJwtToken(accessToken, config.jwt.secret);

        const session = await AuthService.validateSession(decoded.id, decoded.session_id);

        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, role: true, email: true, first_name: true },
        });

        if (!user) {
          return next(new AppError("User not found.", 401));
        }

        req.currentUser = user;
        req.sessionId = session.id;
        req.user = user;
        if (!req.validatedQuery) req.validatedQuery = req.query;

        return next();
      } catch (error) {
        if (!(error instanceof AppError) || error.message !== "Token expired") {
          logger.error(`Access token validation error: ${error}`);
          return next(error);
        }
        logger.info("Access token expired, attempting refresh");
      }
    }

    // 4) If no valid access token, use refresh token
    if (!refreshToken) {
      return next(new AppError("Authentication failed. Please login again.", 401));
    }

    try {
      const decoded = await AuthService.VerifyJwtToken(
        refreshToken,
        config.jwt.refreshSecret
      );

      const session = await AuthService.validateSession(decoded.id, decoded.session_id);

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, role: true, email: true, first_name: true },
      });

      if (!user) {
        return next(new AppError("User not found.", 401));
      }

      const newPayload = {
        id: decoded.id,
        first_name: user.first_name,
        role: user.role,
        email: user.email,
        session_id: session.id,
      };

      const newAccessToken = await AuthService.generateAccessToken(newPayload);
      const newRefreshToken = await AuthService.generateRefreshToken(newPayload);

      // 5) Send back refreshed tokens
      if (config.auth.useCookieAuth) {
        await AuthService.setAuthCookies(res, newAccessToken, newRefreshToken);
      }

      res.setHeader("X-TRIPPZ-ACCESS-TOKEN", newAccessToken);
      res.setHeader("X-TRIPPZ-REFRESH-TOKEN", newRefreshToken);

      req.currentUser = user;
      req.sessionId = session.id;
      req.user = user;
      if (!req.validatedQuery) req.validatedQuery = req.query;

      return next();
    } catch (error) {
      logger.error(`Refresh token validation error: ${error}`);
      return next(new AppError("Session expired. Please login again.", 401));
    }
  } catch (error) {
    logger.error(`Authentication middleware error: ${error}`);
    return next(new AppError("Authentication failed", 401));
  }
};

/**
 * Restrict to specific roles
 */
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.currentUser) {
      return next(new AppError("You are not logged in.", 401));
    }

    if (!roles.includes(req.currentUser.role)) {
      return next(
        new AppError("You do not have permission to perform this action.", 403)
      );
    }
    if (!req.validatedQuery) {
      req.validatedQuery = req.query;
    }

    next();
  };
};

/**
 * Optional auth middleware - doesn't require authentication but attaches user if token is valid
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1) Get token from authorization header or cookies
    let accessToken: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer") &&
      req.headers.authorization.split(" ")[1]
    ) {
      accessToken = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      accessToken = req.cookies.accessToken;
    } else if (req.body?.accessToken) {
      accessToken = req.body.accessToken;
    }

    // If no token, just continue without authentication
    if (!accessToken) {
      return next();
    }

    // 2) Verify token
    try {
      const decoded = await AuthService.VerifyJwtToken(accessToken, config.jwt.secret);

      // Validate session
      const session = await AuthService.validateSession(decoded.id, decoded.session_id);

      // Fetch user
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, role: true, email: true, first_name: true },
      });

      if (user) {
        // Attach user and session info to request
        req.currentUser = user;
        req.sessionId = session.id;
        req.user = user; // For backward compatibility
      }
    } catch (error) {
      // Just continue without authentication if token is invalid
      logger.debug(`Optional auth token invalid: ${error}`);
    }

    next();
  } catch (error) {
    // Just continue without authentication if there's an error
    logger.error(`Optional auth error: ${error}`);
    next();
  }
};

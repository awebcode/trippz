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
 * - Requires access token (mandatory) from headers (x-trippz-access-token) or cookies (accessToken)
 * - Treats refresh token as optional from headers (x-trippz-refresh-token) or cookies (refreshToken)
 * - Ensures refresh token, if provided, is from the same source as access token
 * - Refreshes tokens if access token is expired and refresh token is valid
 * - Validates session in DB
 * - Attaches user and session info to req
 * - Sets new tokens only when valid or successfully refreshed
 */
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1) Get tokens from headers or cookies
    const headerAccessToken = req.headers["x-trippz-access-token"] as string | undefined;
    const headerRefreshToken = req.headers["x-trippz-refresh-token"] as
      | string
      | undefined;
    const cookieAccessToken = req.cookies?.accessToken;
    const cookieRefreshToken = req.cookies?.refreshToken;

    // Reject Authorization header if present
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer") &&
      req.headers.authorization.split(" ")[1]?.startsWith("ey")
    ) {
      return next(
        new AppError("Use X-TRIPPZ headers only, not Authorization header.", 400)
      );
    }

    // 2) Determine access token (mandatory) and refresh token (optional)
    let accessToken: string | undefined;
    let refreshToken: string | undefined;
    let tokenSource: "headers" | "cookies" | null = null;

    if (headerAccessToken && headerAccessToken.startsWith("ey")) {
      accessToken = headerAccessToken;
      refreshToken = headerRefreshToken?.startsWith("ey")
        ? headerRefreshToken
        : undefined;
      tokenSource = "headers";
    } else if (cookieAccessToken && cookieAccessToken.startsWith("ey")) {
      accessToken = cookieAccessToken;
      refreshToken = cookieRefreshToken?.startsWith("ey")
        ? cookieRefreshToken
        : undefined;
      tokenSource = "cookies";
    } else {
      return next(
        new AppError("Access token is required. Please login and try again .", 401)
      );
    }

    // Ensure refresh token, if provided, is from the same source
    if (refreshToken) {
      const refreshSource = headerRefreshToken?.startsWith("ey")
        ? "headers"
        : cookieRefreshToken?.startsWith("ey")
          ? "cookies"
          : null;
      if (refreshSource !== tokenSource) {
        return next(
          new AppError(
            "Access and refresh tokens must come from the same source (headers or cookies).",
            401
          )
        );
      }
    }

    logger.debug(
      `Token source: ${tokenSource}, Access: ${accessToken?.slice(0, 10)}..., Refresh: ${refreshToken ? refreshToken.slice(0, 10) + "..." : "none"}`
    );

    // 3) Try verifying access token
    let user, session;
    try {
      const decoded = await AuthService.VerifyJwtToken(
        accessToken as string,
        config.jwt.secret
      );

      session = await AuthService.validateSession(decoded.id, decoded.session_id);

      user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, role: true, email: true, first_name: true },
      });

      if (!user) {
        return next(new AppError("User not found.", 401));
      }

      // Access token is valid, attach user and session
      req.currentUser = user;
      req.sessionId = session.id;
      req.user = user;
      req.validatedQuery = {
        ...req.query,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
      };

      return next();
    } catch (error) {
      if (error instanceof AppError && error.message === "Token expired") {
        logger.info("Access token expired, checking for refresh token");
      } else {
        logger.error(`Access token validation error: ${error}`);
        return next(new AppError("Invalid access token. Please login again.", 401));
      }
    }

    // 4) If access token is expired, check for refresh token
    if (!refreshToken) {
      return next(
        new AppError(
          "Access token expired and no refresh token provided. Please login again.",
          401
        )
      );
    }

    try {
      const decoded = await AuthService.VerifyJwtToken(
        refreshToken,
        config.jwt.refreshSecret
      );

      session = await AuthService.validateSession(decoded.id, decoded.session_id);

      user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, role: true, email: true, first_name: true },
      });

      if (!user) {
        return next(new AppError("User not found. Please login again.", 401));
      }

      // Generate new tokens
      const newPayload = {
        id: decoded.id,
        first_name: user.first_name,
        role: user.role,
        email: user.email,
        session_id: session.id,
      };

      const newAccessToken = await AuthService.generateAccessToken(newPayload);
      const newRefreshToken = await AuthService.generateRefreshToken(newPayload);

      // 5) Set new tokens based on source and config
      if (config.auth.useCookieAuth && tokenSource === "cookies") {
        await AuthService.setAuthCookies(res, newAccessToken, newRefreshToken);
      } else if (tokenSource === "headers") {
        res.setHeader("X-TRIPPZ-ACCESS-TOKEN", newAccessToken);
        res.setHeader("X-TRIPPZ-REFRESH-TOKEN", newRefreshToken);
      } else {
        logger.warn(
          `Token source mismatch: useCookieAuth=${config.auth.useCookieAuth}, tokenSource=${tokenSource}`
        );
        // Optionally reject if strict enforcement is needed
      }

      // Attach user and session
      req.currentUser = user;
      req.sessionId = session.id;
      req.user = user;
      req.validatedQuery = {
        ...req.query,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
      };

      return next();
    } catch (error) {
      logger.error(`Refresh token validation error: ${error}`);
      return next(new AppError("Session expired. Please login again.", 401));
    }
  } catch (error) {
    logger.error(`Authentication middleware error: ${error}`);
    return next(new AppError("Authentication failed. Please login again.", 401));
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
    req.validatedQuery = {
      ...req.query,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
    };

    next();
  };
};

/**
 * Optional auth middleware - doesn't require authentication but attaches user if token is valid
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1) Get token from headers or cookies
    let accessToken: string | undefined;

    if (req.headers["x-trippz-access-token"]) {
      accessToken = req.headers["x-trippz-access-token"] as string;
    } else if (req.cookies?.accessToken) {
      accessToken = req.cookies.accessToken;
    } else if (req.body?.accessToken) {
      accessToken = req.body.accessToken;
    }

    // If no token, continue without authentication
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
        req.user = user;
      }
    } catch (error) {
      logger.debug(`Optional auth token invalid: ${error}`);
    }

    next();
  } catch (error) {
    logger.error(`Optional auth error: ${error}`);
    next();
  }
};

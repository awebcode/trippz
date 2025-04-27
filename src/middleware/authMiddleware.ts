import type { Request, Response, NextFunction } from "express"
import { prisma } from "../lib/prisma"
import { AppError } from "../utils/appError"
import { logger } from "../utils/logger"
import { AuthService } from "../services/authService"
import { config } from "../config"

declare global {
  namespace Express {
    interface Request {
      currentUser: {
        id: string
        role: string
        email: string
        first_name: string
      }
      sessionId?: string
      validatedQuery?: any
      user?: any // For backward compatibility
    }
  }
}

// Cookie options
export const getCookieOptions = (expires?: number) => {
  const isProduction = config.server.nodeEnv === "production"
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("strict" as const) : ("lax" as const),
    maxAge: expires || 30 * 24 * 60 * 60 * 1000, // 30 days
    path: "/",
  }
}

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
    let accessToken: string | undefined
    let refreshToken: string | undefined

    // Check for access token in Authorization header (Bearer token)
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer") &&
      req.headers.authorization.split(" ")[1]
    ) {
      accessToken = req.headers.authorization.split(" ")[1]
    }
    // Check for access token in cookies
    else if (req.cookies?.accessToken) {
      accessToken = req.cookies.accessToken
    }
    // Check for access token in request body (mobile apps sometimes send it here)
    else if (req.body?.accessToken) {
      accessToken = req.body.accessToken
    }

    // Check for refresh token in cookies
    if (req.cookies?.refreshToken) {
      refreshToken = req.cookies.refreshToken
    }
    // Check for refresh token in request body
    else if (req.body?.refreshToken) {
      refreshToken = req.body.refreshToken
    }

    // Early exit if no tokens are provided
    if (!accessToken && !refreshToken) {
      return next(new AppError("Authentication required. Please login.", 401))
    }

    // 2) Try verifying access token
    if (accessToken) {
      try {
        const decoded = await AuthService.VerifyJwtToken(accessToken, config.jwt.secret)

        // Validate session
        const session = await AuthService.validateSession(decoded.id, decoded.session_id)

        // Fetch user
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, role: true, email: true, first_name: true },
        })

        if (!user) {
          return next(new AppError("The user belonging to this token no longer exists.", 401))
        }

        // Attach user and session info to request
        req.currentUser = user
        req.sessionId = session.id
        req.user = user // For backward compatibility
        return next()
      } catch (error) {
        // Only proceed to refresh logic if token is expired
        if (!(error instanceof AppError) || error.message !== "Token expired") {
          logger.error(`Access token validation error: ${error}`)
          return next(error)
        }
        logger.info("Access token expired, attempting to refresh")
      }
    }

    // 3) Handle refresh token if access token is missing or expired
    if (!refreshToken) {
      return next(new AppError("Authentication failed. Please login again.", 401))
    }

    try {
      // Verify refresh token
      const decoded = await AuthService.VerifyJwtToken(refreshToken, config.jwt.refreshSecret)

      // Validate session
      const session = await AuthService.validateSession(decoded.id, decoded.session_id)

      // Fetch user
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, role: true, email: true, first_name: true },
      })

      if (!user) {
        return next(new AppError("The user belonging to this token no longer exists.", 401))
      }

      // Generate new tokens
      const newPayload = {
        id: decoded.id,
        first_name: user.first_name,
        role: user.role,
        email: user.email,
        session_id: session.id,
      }

      const newAccessToken = await AuthService.generateAccessToken(newPayload)
      const newRefreshToken = await AuthService.generateRefreshToken(newPayload)

      // Set new cookies if cookie auth is enabled
      if (config.auth.useCookieAuth) {
        await AuthService.setAuthCookies(res, newAccessToken, newRefreshToken)
      }

      // Add tokens to response header for non-cookie auth (mobile apps)
      res.setHeader("X-Access-Token", newAccessToken)
      res.setHeader("X-Refresh-Token", newRefreshToken)

      // Attach user and session info to request
      req.currentUser = user
      req.sessionId = session.id
      req.user = user // For backward compatibility
      return next()
    } catch (error) {
      logger.error(`Refresh token validation error: ${error}`)
      return next(new AppError("Your session has expired. Please log in again.", 401))
    }
  } catch (error) {
    logger.error(`Authentication error: ${error}`)
    return next(error instanceof AppError ? error : new AppError("Authentication failed", 401))
  }
}

/**
 * Restrict to specific roles
 */
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.currentUser) {
      return next(new AppError("You are not logged in.", 401))
    }

    if (!roles.includes(req.currentUser.role)) {
      return next(new AppError("You do not have permission to perform this action.", 403))
    }

    next()
  }
}

/**
 * Optional auth middleware - doesn't require authentication but attaches user if token is valid
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1) Get token from authorization header or cookies
    let accessToken: string | undefined

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer") &&
      req.headers.authorization.split(" ")[1]
    ) {
      accessToken = req.headers.authorization.split(" ")[1]
    } else if (req.cookies?.accessToken) {
      accessToken = req.cookies.accessToken
    } else if (req.body?.accessToken) {
      accessToken = req.body.accessToken
    }

    // If no token, just continue without authentication
    if (!accessToken) {
      return next()
    }

    // 2) Verify token
    try {
      const decoded = await AuthService.VerifyJwtToken(accessToken, config.jwt.secret)

      // Validate session
      const session = await AuthService.validateSession(decoded.id, decoded.session_id)

      // Fetch user
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, role: true, email: true, first_name: true },
      })

      if (user) {
        // Attach user and session info to request
        req.currentUser = user
        req.sessionId = session.id
        req.user = user // For backward compatibility
      }
    } catch (error) {
      // Just continue without authentication if token is invalid
      logger.debug(`Optional auth token invalid: ${error}`)
    }

    next()
  } catch (error) {
    // Just continue without authentication if there's an error
    logger.error(`Optional auth error: ${error}`)
    next()
  }
}

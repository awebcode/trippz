import type { Request, Response, NextFunction } from "express"
import { prisma } from "../lib/prisma"
import { AppError } from "../utils/appError"
import { verifyToken, TokenType, refreshTokens } from "../utils/tokens"
import { logger } from "../utils/logger"

interface JwtPayload {
  id: string
  role: string
  type: TokenType
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        role: string
      }
    }
  }
}

// Set cookie options
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production"
  
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: "/",
  } as const
}

// Protect routes - verify access token
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1) Get token from authorization header or cookies
    let token: string | undefined

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken
    }

    if (!token) {
      return next(new AppError("You are not logged in. Please log in to get access.", 401))
    }

    try {
      // 2) Verify token
      const decoded = verifyToken<JwtPayload>(token, TokenType.ACCESS)

      // 3) Check if user still exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, role: true },
      })

      if (!user) {
        return next(new AppError("The user belonging to this token no longer exists.", 401))
      }

      // 4) Grant access to protected route
      req.user = user
      next()
    } catch (error) {
      // If access token is invalid or expired, try to use refresh token
      if (req.cookies?.refreshToken) {
        try {
          const { accessToken, refreshToken } = await refreshTokens(req.cookies.refreshToken)

          // Set new cookies
          const isProduction = process.env.NODE_ENV === "production"
          res.cookie("accessToken", accessToken, getCookieOptions())
          res.cookie("refreshToken", refreshToken, getCookieOptions())

          // Verify the new access token
          const decoded = verifyToken<JwtPayload>(accessToken, TokenType.ACCESS)

          // Check if user still exists
          const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, role: true },
          })

          if (!user) {
            return next(new AppError("The user belonging to this token no longer exists.", 401))
          }

          // Grant access to protected route
          req.user = user
          next()
        } catch (refreshError) {
          logger.error(`Error refreshing token: ${refreshError}`)
          return next(new AppError("Your session has expired. Please log in again.", 401))
        }
      } else {
        return next(new AppError("Invalid token. Please log in again.", 401))
      }
    }
  } catch (error) {
    next(error)
  }
}

// Restrict to specific roles
export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("You are not logged in.", 401))
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action.", 403))
    }

    next()
  }
}

// Set tokens in cookies
export const setTokenCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie("accessToken", accessToken, getCookieOptions())
  res.cookie("refreshToken", refreshToken, getCookieOptions())
}

// Clear token cookies
export const clearTokenCookies = (res: Response) => {
  res.cookie("accessToken", "", getCookieOptions())
  res.cookie("refreshToken", "", getCookieOptions())
}

import jwt from "jsonwebtoken"
import { AppError } from "./appError"
import { logger } from "./logger"
import { prisma } from "../lib/prisma"
import crypto from "crypto"

// Token types
export enum TokenType {
  ACCESS = "access",
  REFRESH = "refresh",
  RESET_PASSWORD = "reset_password",
  EMAIL_VERIFICATION = "email_verification",
  PHONE_VERIFICATION = "phone_verification",
}

// Interface for token payload
interface TokenPayload {
  id: string
  type: TokenType
  [key: string]: any
}

// Generate JWT token
// Generate JWT token
export const generateToken = (
  payload: Omit<TokenPayload, "type">,
  type: TokenType,
  expiresIn: string = process.env.JWT_EXPIRES_IN || "1d",
): string => {
  try {
    const expirationTime = Math.floor(Date.now() / 1000) + parseInt(expiresIn, 10);
    const tokenPayload = {
      ...payload,
      type,
      exp: expirationTime,
    };

    const secret = getSecretForTokenType(type);

    return jwt.sign(tokenPayload, secret);
  } catch (error: any) {
    logger.error(`Error generating ${type} token: ${error.message}`);
    throw new AppError(`Failed to generate ${type} token`, 500);
  }
}

// Verify JWT token
export function verifyToken<T extends TokenPayload>(token: string, type: TokenType): T {
  try {
    const secret = getSecretForTokenType(type)
    const decoded = jwt.verify(token, secret) as T

    // Verify token type
    if (decoded.type !== type) {
      throw new AppError("Invalid token type", 401)
    }

    return decoded
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      throw new AppError("Token has expired", 401)
    }
    if (error.name === "JsonWebTokenError") {
      throw new AppError("Invalid token", 401)
    }
    throw error
  }
}

// Get secret based on token type
const getSecretForTokenType = (type: TokenType): string => {
  switch (type) {
    case TokenType.ACCESS:
      return process.env.JWT_SECRET as string
    case TokenType.REFRESH:
      return process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET as string)
    case TokenType.RESET_PASSWORD:
      return process.env.JWT_RESET_PASSWORD_SECRET || (process.env.JWT_SECRET as string)
    case TokenType.EMAIL_VERIFICATION:
      return process.env.JWT_EMAIL_VERIFICATION_SECRET || (process.env.JWT_SECRET as string)
    case TokenType.PHONE_VERIFICATION:
      return process.env.JWT_PHONE_VERIFICATION_SECRET || (process.env.JWT_SECRET as string)
    default:
      return process.env.JWT_SECRET as string
  }
}

// Generate access and refresh tokens
export const generateAuthTokens = async (userId: string) => {
  try {
    // Get user role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (!user) {
      throw new AppError("User not found", 404)
    }

    // Generate tokens
    const accessToken = generateToken(
      { id: userId, role: user.role },
      TokenType.ACCESS,
      process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    )

    const refreshToken = generateToken(
      { id: userId, role: user.role },
      TokenType.REFRESH,
      process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    )

    // Hash refresh token for storage
    const hashedRefreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex")

    // Store refresh token in database
    await prisma.refreshToken.upsert({
      where: { userId },
      update: {
        token: hashedRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      create: {
        userId,
        token: hashedRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    })

    return { accessToken, refreshToken }
  } catch (error: any) {
    logger.error(`Error generating auth tokens: ${error.message}`)
    throw new AppError("Failed to generate authentication tokens", 500)
  }
}

// Refresh tokens
export const refreshTokens = async (refreshToken: string) => {
  try {
    // Verify refresh token
    const decoded = verifyToken<{ id: string; type: TokenType }>(refreshToken, TokenType.REFRESH)

    // Hash refresh token for comparison
    const hashedRefreshToken = crypto.createHash("sha256").update(refreshToken).digest("hex")

    // Find stored refresh token
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        userId: decoded.id,
        token: hashedRefreshToken,
        expiresAt: {
          gt: new Date(),
        },
      },
    })

    if (!storedToken) {
      throw new AppError("Invalid refresh token", 401)
    }

    // Generate new tokens
    return await generateAuthTokens(decoded.id)
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError("Failed to refresh authentication tokens", 500)
  }
}

// Revoke refresh token
export const revokeRefreshToken = async (userId: string) => {
  try {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    })
  } catch (error: any) {
    logger.error(`Error revoking refresh token: ${error.message}`)
    throw new AppError("Failed to revoke refresh token", 500)
  }
}

// Generate verification token
export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex")
}

// Generate reset password token
export const generateResetPasswordToken = (userId: string) => {
  return generateToken({ id: userId }, TokenType.RESET_PASSWORD, "1h")
}

// Generate phone verification code
export const generatePhoneVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

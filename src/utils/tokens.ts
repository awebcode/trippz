import jwt from "jsonwebtoken";
import { AppError } from "./appError";
import { logger } from "./logger";
import { prisma } from "../lib/prisma";
import crypto from "crypto";
import type { Role } from "@prisma/client";
import { config } from "../config";
import { AuthService } from "../services/authService";

// Token types
export enum TokenType {
  ACCESS = "access",
  REFRESH = "refresh",
  RESET_PASSWORD = "reset_password",
  EMAIL_VERIFICATION = "email_verification",
  PHONE_VERIFICATION = "phone_verification",
}

// Interface for token payload
export interface TokenPayload {
  id: string;
  first_name: string;
  email: string;
  role: Role;
  [key: string]: any;
}

// Generate JWT token
// Generate JWT token
export const generateToken = (
  payload: Omit<TokenPayload, "type">,
  type: TokenType,
  expiresIn: string = config.jwt.accessExpiresIn || "1d"
): string => {
  try {
    const expirationTime = Math.floor(Date.now() / 1000) + Number.parseInt(expiresIn, 10);
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
};

// Verify JWT token
export function verifyToken<T extends TokenPayload>(token: string, type: TokenType): T {
  try {
    const secret = getSecretForTokenType(type);
    const decoded = jwt.verify(token, secret) as T;

    // Verify token type
    if (decoded.type !== type) {
      throw new AppError("Invalid token type", 401);
    }

    return decoded;
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      throw new AppError("Token has expired", 401);
    }
    if (error.name === "JsonWebTokenError") {
      throw new AppError("Invalid token", 401);
    }
    throw error;
  }
}

// Get secret based on token type
export const getSecretForTokenType = (type: TokenType): string => {
  switch (type) {
    case TokenType.ACCESS:
      return config.jwt.secret;
    case TokenType.REFRESH:
      return config.jwt.refreshSecret;
    case TokenType.RESET_PASSWORD:
      return config.jwt.resetPasswordSecret;
    case TokenType.EMAIL_VERIFICATION:
      return config.jwt.emailVerificationSecret;
    case TokenType.PHONE_VERIFICATION:
      return config.jwt.phoneVerificationSecret;
    default:
      return config.jwt.secret;
  }
};

// Generate access and refresh tokens
export const generateAuthTokens = async (userId: string,sessionId: string) => {
  try {
    // Get user role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {id: true, role: true, first_name: true, email: true },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

     const newPayload = {
       id: user.id,
       first_name: user.first_name,
       role: user.role,
       email: user.email,
       session_id: sessionId,
     };

    // Generate tokens
    const accessToken = await AuthService.generateAccessToken(newPayload);

    const refreshToken = await AuthService.generateRefreshToken(newPayload);

    logger.info(`Generated auth tokens for user ${userId}`);

    return { accessToken, refreshToken };
  } catch (error: any) {
    logger.error(`Error generating auth tokens: ${error.message}`);
    throw new AppError("Failed to generate authentication tokens", 500);
  }
};



// Revoke refresh token
export const revokeRefreshToken = async (userId: string) => {
  try {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  } catch (error: any) {
    logger.error(`Error revoking refresh token: ${error.message}`);
    throw new AppError("Failed to revoke refresh token", 500);
  }
};

// Generate verification token
export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Generate reset password token
export const generateResetPasswordToken = (userId: string) => {
  return generateToken({ id: userId }, TokenType.RESET_PASSWORD, "1h");
};

// Generate phone verification code
export const generatePhoneVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

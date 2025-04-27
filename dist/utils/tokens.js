"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePhoneVerificationCode = exports.generateResetPasswordToken = exports.generateVerificationToken = exports.revokeRefreshToken = exports.generateAuthTokens = exports.getSecretForTokenType = exports.generateToken = exports.TokenType = void 0;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const appError_1 = require("./appError");
const logger_1 = require("./logger");
const prisma_1 = require("../lib/prisma");
const crypto_1 = __importDefault(require("crypto"));
const config_1 = require("../config");
const authService_1 = require("../services/authService");
// Token types
var TokenType;
(function (TokenType) {
    TokenType["ACCESS"] = "access";
    TokenType["REFRESH"] = "refresh";
    TokenType["RESET_PASSWORD"] = "reset_password";
    TokenType["EMAIL_VERIFICATION"] = "email_verification";
    TokenType["PHONE_VERIFICATION"] = "phone_verification";
})(TokenType || (exports.TokenType = TokenType = {}));
// Generate JWT token
// Generate JWT token
const generateToken = (payload, type, expiresIn = config_1.config.jwt.accessExpiresIn || "1d") => {
    try {
        const expirationTime = Math.floor(Date.now() / 1000) + Number.parseInt(expiresIn, 10);
        const tokenPayload = {
            ...payload,
            type,
            exp: expirationTime,
        };
        const secret = (0, exports.getSecretForTokenType)(type);
        return jsonwebtoken_1.default.sign(tokenPayload, secret);
    }
    catch (error) {
        logger_1.logger.error(`Error generating ${type} token: ${error.message}`);
        throw new appError_1.AppError(`Failed to generate ${type} token`, 500);
    }
};
exports.generateToken = generateToken;
// Verify JWT token
function verifyToken(token, type) {
    try {
        const secret = (0, exports.getSecretForTokenType)(type);
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // Verify token type
        if (decoded.type !== type) {
            throw new appError_1.AppError("Invalid token type", 401);
        }
        return decoded;
    }
    catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new appError_1.AppError("Token has expired", 401);
        }
        if (error.name === "JsonWebTokenError") {
            throw new appError_1.AppError("Invalid token", 401);
        }
        throw error;
    }
}
// Get secret based on token type
const getSecretForTokenType = (type) => {
    switch (type) {
        case TokenType.ACCESS:
            return config_1.config.jwt.secret;
        case TokenType.REFRESH:
            return config_1.config.jwt.refreshSecret;
        case TokenType.RESET_PASSWORD:
            return config_1.config.jwt.resetPasswordSecret;
        case TokenType.EMAIL_VERIFICATION:
            return config_1.config.jwt.emailVerificationSecret;
        case TokenType.PHONE_VERIFICATION:
            return config_1.config.jwt.phoneVerificationSecret;
        default:
            return config_1.config.jwt.secret;
    }
};
exports.getSecretForTokenType = getSecretForTokenType;
// Generate access and refresh tokens
const generateAuthTokens = async (userId, sessionId) => {
    try {
        // Get user role
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true, first_name: true, email: true },
        });
        if (!user) {
            throw new appError_1.AppError("User not found", 404);
        }
        const newPayload = {
            id: user.id,
            first_name: user.first_name,
            role: user.role,
            email: user.email,
            session_id: sessionId,
        };
        // Generate tokens
        const accessToken = await authService_1.AuthService.generateAccessToken(newPayload);
        const refreshToken = await authService_1.AuthService.generateRefreshToken(newPayload);
        logger_1.logger.info(`Generated auth tokens for user ${userId}`);
        return { accessToken, refreshToken };
    }
    catch (error) {
        logger_1.logger.error(`Error generating auth tokens: ${error.message}`);
        throw new appError_1.AppError("Failed to generate authentication tokens", 500);
    }
};
exports.generateAuthTokens = generateAuthTokens;
// Revoke refresh token
const revokeRefreshToken = async (userId) => {
    try {
        await prisma_1.prisma.refreshToken.deleteMany({
            where: { userId },
        });
    }
    catch (error) {
        logger_1.logger.error(`Error revoking refresh token: ${error.message}`);
        throw new appError_1.AppError("Failed to revoke refresh token", 500);
    }
};
exports.revokeRefreshToken = revokeRefreshToken;
// Generate verification token
const generateVerificationToken = () => {
    return crypto_1.default.randomBytes(32).toString("hex");
};
exports.generateVerificationToken = generateVerificationToken;
// Generate reset password token
const generateResetPasswordToken = (userId) => {
    return (0, exports.generateToken)({ id: userId }, TokenType.RESET_PASSWORD, "1h");
};
exports.generateResetPasswordToken = generateResetPasswordToken;
// Generate phone verification code
const generatePhoneVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.generatePhoneVerificationCode = generatePhoneVerificationCode;
//# sourceMappingURL=tokens.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.restrictTo = exports.protect = exports.getCookieOptions = void 0;
const prisma_1 = require("../lib/prisma");
const appError_1 = require("../utils/appError");
const logger_1 = require("../utils/logger");
const authService_1 = require("../services/authService");
const config_1 = require("../config");
// Cookie options
const getCookieOptions = (expires) => {
    const isProduction = config_1.config.server.nodeEnv === "production";
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "strict" : "lax",
        maxAge: expires || 30 * 24 * 60 * 60 * 1000, // 30 days
        path: "/",
    };
};
exports.getCookieOptions = getCookieOptions;
/**
 * Auth Middleware
 * - Verifies access token from cookies or Authorization header
 * - Refreshes tokens if access token is expired using refresh token
 * - Validates session in DB
 * - Attaches user and session info to req
 */
const protect = async (req, res, next) => {
    try {
        // 1) Get token from authorization header or cookies
        let accessToken;
        let refreshToken;
        // Check for access token in Authorization header (Bearer token)
        if (req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer") &&
            req.headers.authorization.split(" ")[1]) {
            accessToken = req.headers.authorization.split(" ")[1];
        }
        // Check for access token in cookies
        else if (req.cookies?.accessToken) {
            accessToken = req.cookies.accessToken;
        }
        // Check for access token in request body (mobile apps sometimes send it here)
        else if (req.body?.accessToken) {
            accessToken = req.body.accessToken;
        }
        // Check for refresh token in cookies
        if (req.cookies?.refreshToken) {
            refreshToken = req.cookies.refreshToken;
        }
        // Check for refresh token in request body
        else if (req.body?.refreshToken) {
            refreshToken = req.body.refreshToken;
        }
        // Early exit if no tokens are provided
        if (!accessToken && !refreshToken) {
            return next(new appError_1.AppError("Authentication required. Please login.", 401));
        }
        // 2) Try verifying access token
        if (accessToken) {
            try {
                const decoded = await authService_1.AuthService.VerifyJwtToken(accessToken, config_1.config.jwt.secret);
                // Validate session
                const session = await authService_1.AuthService.validateSession(decoded.id, decoded.session_id);
                // Fetch user
                const user = await prisma_1.prisma.user.findUnique({
                    where: { id: decoded.id },
                    select: { id: true, role: true, email: true, first_name: true },
                });
                if (!user) {
                    return next(new appError_1.AppError("The user belonging to this token no longer exists.", 401));
                }
                // Attach user and session info to request
                req.currentUser = user;
                req.sessionId = session.id;
                req.user = user; // For backward compatibility
                if (!req.validatedQuery) {
                    req.validatedQuery = req.query;
                }
                return next();
            }
            catch (error) {
                // Only proceed to refresh logic if token is expired
                if (!(error instanceof appError_1.AppError) || error.message !== "Token expired") {
                    logger_1.logger.error(`Access token validation error: ${error}`);
                    return next(error);
                }
                logger_1.logger.info("Access token expired, attempting to refresh");
            }
        }
        // 3) Handle refresh token if access token is missing or expired
        if (!refreshToken) {
            return next(new appError_1.AppError("Authentication failed. Please login again.", 401));
        }
        try {
            // Verify refresh token
            const decoded = await authService_1.AuthService.VerifyJwtToken(refreshToken, config_1.config.jwt.refreshSecret);
            // Validate session
            const session = await authService_1.AuthService.validateSession(decoded.id, decoded.session_id);
            // Fetch user
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: decoded.id },
                select: { id: true, role: true, email: true, first_name: true },
            });
            if (!user) {
                return next(new appError_1.AppError("The user belonging to this token no longer exists.", 401));
            }
            // Generate new tokens
            const newPayload = {
                id: decoded.id,
                first_name: user.first_name,
                role: user.role,
                email: user.email,
                session_id: session.id,
            };
            const newAccessToken = await authService_1.AuthService.generateAccessToken(newPayload);
            const newRefreshToken = await authService_1.AuthService.generateRefreshToken(newPayload);
            // Set new cookies if cookie auth is enabled
            if (config_1.config.auth.useCookieAuth) {
                await authService_1.AuthService.setAuthCookies(res, newAccessToken, newRefreshToken);
            }
            // Add tokens to response header for non-cookie auth (mobile apps)
            res.setHeader("X-Access-Token", newAccessToken);
            res.setHeader("X-Refresh-Token", newRefreshToken);
            // Attach user and session info to request
            req.currentUser = user;
            req.sessionId = session.id;
            req.user = user; // For backward compatibility
            if (!req.validatedQuery) {
                req.validatedQuery = req.query;
            }
            return next();
        }
        catch (error) {
            logger_1.logger.error(`Refresh token validation error: ${error}`);
            return next(new appError_1.AppError("Your session has expired. Please log in again.", 401));
        }
    }
    catch (error) {
        logger_1.logger.error(`Authentication error: ${error}`);
        return next(error instanceof appError_1.AppError ? error : new appError_1.AppError("Authentication failed", 401));
    }
};
exports.protect = protect;
/**
 * Restrict to specific roles
 */
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.currentUser) {
            return next(new appError_1.AppError("You are not logged in.", 401));
        }
        if (!roles.includes(req.currentUser.role)) {
            return next(new appError_1.AppError("You do not have permission to perform this action.", 403));
        }
        if (!req.validatedQuery) {
            req.validatedQuery = req.query;
        }
        next();
    };
};
exports.restrictTo = restrictTo;
/**
 * Optional auth middleware - doesn't require authentication but attaches user if token is valid
 */
const optionalAuth = async (req, res, next) => {
    try {
        // 1) Get token from authorization header or cookies
        let accessToken;
        if (req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer") &&
            req.headers.authorization.split(" ")[1]) {
            accessToken = req.headers.authorization.split(" ")[1];
        }
        else if (req.cookies?.accessToken) {
            accessToken = req.cookies.accessToken;
        }
        else if (req.body?.accessToken) {
            accessToken = req.body.accessToken;
        }
        // If no token, just continue without authentication
        if (!accessToken) {
            return next();
        }
        // 2) Verify token
        try {
            const decoded = await authService_1.AuthService.VerifyJwtToken(accessToken, config_1.config.jwt.secret);
            // Validate session
            const session = await authService_1.AuthService.validateSession(decoded.id, decoded.session_id);
            // Fetch user
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: decoded.id },
                select: { id: true, role: true, email: true, first_name: true },
            });
            if (user) {
                // Attach user and session info to request
                req.currentUser = user;
                req.sessionId = session.id;
                req.user = user; // For backward compatibility
            }
        }
        catch (error) {
            // Just continue without authentication if token is invalid
            logger_1.logger.debug(`Optional auth token invalid: ${error}`);
        }
        next();
    }
    catch (error) {
        // Just continue without authentication if there's an error
        logger_1.logger.error(`Optional auth error: ${error}`);
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=authMiddleware.js.map
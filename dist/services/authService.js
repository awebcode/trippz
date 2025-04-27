"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../lib/prisma");
const appError_1 = require("../utils/appError");
const email_1 = require("../utils/email");
const sms_1 = require("../utils/sms");
const logger_1 = require("../utils/logger");
const tokens_1 = require("../utils/tokens");
const google_auth_library_1 = require("google-auth-library");
const axios_1 = __importDefault(require("axios"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const config_1 = require("../config");
// Initialize Google OAuth client
const googleClient = new google_auth_library_1.OAuth2Client(config_1.config.oauth.google.clientId, config_1.config.oauth.google.clientSecret);
class AuthService {
    static async register(data) {
        try {
            // Check if user already exists
            const existingUser = await prisma_1.prisma.user.findFirst({
                where: {
                    OR: [{ email: data.email }, ...(data.phone_number ? [{ phone_number: data.phone_number }] : [])],
                },
            });
            if (existingUser) {
                if (existingUser.email === data.email) {
                    throw new appError_1.AppError("Email already in use", 400, [{ path: "email", message: "Email already in use" }]);
                }
                if (data.phone_number && existingUser.phone_number === data.phone_number) {
                    throw new appError_1.AppError("Phone number already in use", 400, [
                        { path: "phone_number", message: "Phone number already in use" },
                    ]);
                }
            }
            // Hash password
            const salt = await bcrypt_1.default.genSalt(10);
            const hashedPassword = await bcrypt_1.default.hash(data.password, salt);
            // Handle full_name
            const nameParts = [data.first_name, data.last_name];
            const firstName = nameParts[0];
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
            // Create verification tokens
            const emailVerificationToken = (0, tokens_1.generateVerificationToken)();
            const phoneVerificationCode = data.phone_number ? (0, tokens_1.generatePhoneVerificationCode)() : null;
            // Create user
            const user = await prisma_1.prisma.user.create({
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    email: data.email,
                    phone_number: data.phone_number,
                    password_hash: hashedPassword,
                    role: data.role,
                    date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : null,
                    address: data.address,
                    Profile: {
                        create: {
                            bio: "",
                            theme: "light",
                            language: "en",
                        },
                    },
                    emailVerification: {
                        create: {
                            token: emailVerificationToken,
                            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                        },
                    },
                    ...(phoneVerificationCode &&
                        data.phone_number && {
                        phoneVerification: {
                            create: {
                                code: phoneVerificationCode,
                                expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
                            },
                        },
                    }),
                },
            });
            // Send verification emails and SMS
            // await EmailService.sendVerificationEmail(data.email, emailVerificationToken)
            // if (data.phone_number && phoneVerificationCode) {
            //   await SmsService.sendVerificationSms(data.phone_number, phoneVerificationCode)
            // }
            //new UserSession
            const userSession = await prisma_1.prisma.userSession.create({
                data: {
                    user_id: user.id,
                },
            });
            // Generate JWT tokens
            const { accessToken, refreshToken } = await (0, tokens_1.generateAuthTokens)(user.id, userSession.id);
            return {
                user: {
                    id: user.id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    role: user.role,
                },
                accessToken,
                refreshToken,
            };
        }
        catch (error) {
            logger_1.logger.error(`Error in register: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to register user", 500);
        }
    }
    static async login(data) {
        try {
            // Find user by email or phone number
            const user = await prisma_1.prisma.user.findFirst({
                where: {
                    OR: [
                        ...(data.email ? [{ email: data.email }] : []),
                        ...(data.phone_number ? [{ phone_number: data.phone_number }] : []),
                    ],
                },
            });
            if (!user) {
                throw new appError_1.AppError("Invalid credentials", 401, [{ path: "email", message: "Invalid credentials" }]);
            }
            // Check password
            const isPasswordValid = await bcrypt_1.default.compare(data.password, user.password_hash);
            if (!isPasswordValid) {
                throw new appError_1.AppError("Invalid credentials", 401, [{ path: "password", message: "Invalid credentials" }]);
            }
            //new UserSession
            const userSession = await prisma_1.prisma.userSession.create({
                data: {
                    user_id: user.id,
                },
            });
            // Generate JWT tokens
            const { accessToken, refreshToken } = await (0, tokens_1.generateAuthTokens)(user.id, userSession.id);
            return {
                user: {
                    id: user.id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    role: user.role,
                },
                accessToken,
                refreshToken,
            };
        }
        catch (error) {
            logger_1.logger.error(`Error in login: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to login", 500);
        }
    }
    static async googleLogin(idToken) {
        try {
            // Verify Google ID token
            const ticket = await googleClient.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            if (!payload || !payload.email) {
                throw new appError_1.AppError("Invalid Google token", 400);
            }
            // Check if user exists
            let user = await prisma_1.prisma.user.findUnique({
                where: { email: payload.email },
            });
            if (!user) {
                // Create new user
                user = await prisma_1.prisma.user.create({
                    data: {
                        email: payload.email,
                        first_name: payload.given_name || "Google",
                        last_name: payload.family_name || "User",
                        phone_number: `google_${Date.now()}`, // Placeholder
                        password_hash: crypto_1.default.randomBytes(16).toString("hex"), // Random password
                        role: "USER",
                        email_verified: true, // Google already verified the email
                        Profile: {
                            create: {
                                bio: "",
                                theme: "light",
                                language: "en",
                                profile_picture: payload.picture,
                            },
                        },
                        socialLogins: {
                            create: {
                                provider: "GOOGLE",
                                providerId: payload.sub,
                            },
                        },
                    },
                });
            }
            else {
                // Check if social login exists
                const socialLogin = await prisma_1.prisma.socialLogin.findFirst({
                    where: {
                        userId: user.id,
                        provider: "GOOGLE",
                    },
                });
                if (!socialLogin) {
                    // Add social login
                    await prisma_1.prisma.socialLogin.create({
                        data: {
                            userId: user.id,
                            provider: "GOOGLE",
                            providerId: payload.sub,
                        },
                    });
                }
            }
            //new UserSession
            const userSession = await prisma_1.prisma.userSession.create({
                data: {
                    user_id: user.id,
                },
            });
            // Generate JWT tokens
            const { accessToken, refreshToken } = await (0, tokens_1.generateAuthTokens)(user.id, userSession.id);
            return {
                user: {
                    id: user.id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    role: user.role,
                },
                accessToken,
                refreshToken,
            };
        }
        catch (error) {
            logger_1.logger.error(`Error in googleLogin: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to login with Google", 500);
        }
    }
    static async facebookLogin(accesssToken) {
        try {
            // Verify Facebook access token
            const response = await axios_1.default.get(`https://graph.facebook.com/me?fields=id,name,email,first_name,last_name,picture&access_token=${accesssToken}`);
            const { id, email, first_name, last_name, picture } = response.data;
            if (!email) {
                throw new appError_1.AppError("Email not provided by Facebook", 400);
            }
            // Check if user exists
            let user = await prisma_1.prisma.user.findUnique({
                where: { email },
            });
            if (!user) {
                // Create new user
                user = await prisma_1.prisma.user.create({
                    data: {
                        email,
                        first_name: first_name || "Facebook",
                        last_name: last_name || "User",
                        phone_number: `facebook_${Date.now()}`, // Placeholder
                        password_hash: crypto_1.default.randomBytes(16).toString("hex"), // Random password
                        role: "USER",
                        email_verified: true, // Facebook already verified the email
                        Profile: {
                            create: {
                                bio: "",
                                theme: "light",
                                language: "en",
                                profile_picture: picture?.data?.url,
                            },
                        },
                        socialLogins: {
                            create: {
                                provider: "FACEBOOK",
                                providerId: id,
                            },
                        },
                    },
                });
            }
            else {
                // Check if social login exists
                const socialLogin = await prisma_1.prisma.socialLogin.findFirst({
                    where: {
                        userId: user.id,
                        provider: "FACEBOOK",
                    },
                });
                if (!socialLogin) {
                    // Add social login
                    await prisma_1.prisma.socialLogin.create({
                        data: {
                            userId: user.id,
                            provider: "FACEBOOK",
                            providerId: id,
                        },
                    });
                }
            }
            //new UserSession
            const userSession = await prisma_1.prisma.userSession.create({
                data: {
                    user_id: user.id,
                },
            });
            // Generate JWT tokens
            const { accessToken, refreshToken } = await (0, tokens_1.generateAuthTokens)(user.id, userSession.id);
            return {
                user: {
                    id: user.id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    role: user.role,
                },
                accessToken,
                refreshToken,
            };
        }
        catch (error) {
            logger_1.logger.error(`Error in facebookLogin: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to login with Facebook", 500);
        }
    }
    static async appleLogin(idToken) {
        try {
            // Parse the token (in a real implementation, you would verify it with Apple)
            const payload = JSON.parse(Buffer.from(idToken.split(".")[1], "base64").toString());
            if (!payload.email) {
                throw new appError_1.AppError("Email not provided by Apple", 400);
            }
            // Check if user exists
            let user = await prisma_1.prisma.user.findUnique({
                where: { email: payload.email },
            });
            if (!user) {
                // Create new user
                user = await prisma_1.prisma.user.create({
                    data: {
                        email: payload.email,
                        first_name: payload.given_name || "Apple",
                        last_name: payload.family_name || "User",
                        phone_number: `apple_${Date.now()}`, // Placeholder
                        password_hash: crypto_1.default.randomBytes(16).toString("hex"), // Random password
                        role: "USER",
                        email_verified: true, // Apple already verified the email
                        Profile: {
                            create: {
                                bio: "",
                                theme: "light",
                                language: "en",
                            },
                        },
                        socialLogins: {
                            create: {
                                provider: "APPLE",
                                providerId: payload.sub,
                            },
                        },
                    },
                });
            }
            else {
                // Check if social login exists
                const socialLogin = await prisma_1.prisma.socialLogin.findFirst({
                    where: {
                        userId: user.id,
                        provider: "APPLE",
                    },
                });
                if (!socialLogin) {
                    // Add social login
                    await prisma_1.prisma.socialLogin.create({
                        data: {
                            userId: user.id,
                            provider: "APPLE",
                            providerId: payload.sub,
                        },
                    });
                }
            }
            //new UserSession
            const userSession = await prisma_1.prisma.userSession.create({
                data: {
                    user_id: user.id,
                },
            });
            // Generate JWT tokens
            const { accessToken, refreshToken } = await (0, tokens_1.generateAuthTokens)(user.id, userSession.id);
            return {
                user: {
                    id: user.id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    role: user.role,
                },
                accessToken,
                refreshToken,
            };
        }
        catch (error) {
            logger_1.logger.error(`Error in appleLogin: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to login with Apple", 500);
        }
    }
    static async socialLogin(data) {
        try {
            switch (data.provider) {
                case "GOOGLE":
                    return await this.googleLogin(data.token);
                case "FACEBOOK":
                    return await this.facebookLogin(data.token);
                case "APPLE":
                    return await this.appleLogin(data.token);
                default:
                    throw new appError_1.AppError("Unsupported social login provider", 400);
            }
        }
        catch (error) {
            logger_1.logger.error(`Error in socialLogin: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to login with social provider", 500);
        }
    }
    static async logout(userId, sessionId, allDevices = false) {
        try {
            if (allDevices) {
                // Revoke all sessions for the user
                await prisma_1.prisma.userSession.deleteMany({
                    where: { user_id: userId },
                });
            }
            else if (sessionId) {
                // Revoke specific session
                await prisma_1.prisma.userSession.delete({
                    where: { id: sessionId, user_id: userId },
                });
            }
            else {
                // Revoke all sessions except current
                await prisma_1.prisma.userSession.deleteMany({
                    where: {
                        user_id: userId,
                        id: { not: sessionId },
                    },
                });
            }
            // Revoke refresh token
            await (0, tokens_1.revokeRefreshToken)(userId);
            return { message: "Logged out successfully" };
        }
        catch (error) {
            logger_1.logger.error(`Error in logout: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to logout", 500);
        }
    }
    static async logoutCurrentSession(userId, sessionId) {
        return this.logout(userId, sessionId);
    }
    static async logoutOtherDevices(userId, currentSessionId) {
        return this.logout(userId, currentSessionId);
    }
    static async logoutAllDevices(userId) {
        return this.logout(userId, undefined, true);
    }
    static async forgotPassword(data) {
        try {
            // Find user by email
            const user = await prisma_1.prisma.user.findUnique({
                where: { email: data.email },
            });
            if (!user) {
                return {
                    message: "If a user with that email exists, a password reset link has been sent",
                };
            }
            // Generate reset token
            const resetToken = (0, tokens_1.generateResetPasswordToken)(user.id);
            // Store reset token in database
            await prisma_1.prisma.passwordReset.upsert({
                where: { userId: user.id },
                update: {
                    token: resetToken,
                    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
                },
                create: {
                    userId: user.id,
                    token: resetToken,
                    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
                },
            });
            // Send password reset email
            await email_1.EmailService.sendPasswordResetEmail(data.email, resetToken);
            return {
                message: "If a user with that email exists, a password reset link has been sent",
            };
        }
        catch (error) {
            logger_1.logger.error(`Error in forgotPassword: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to process forgot password request", 500);
        }
    }
    static async resetPassword(data) {
        try {
            // Verify reset token
            const decoded = (0, tokens_1.verifyToken)(data.token, tokens_1.TokenType.RESET_PASSWORD);
            // Find password reset record
            const passwordReset = await prisma_1.prisma.passwordReset.findFirst({
                where: {
                    userId: decoded.id,
                    token: data.token,
                    expiresAt: {
                        gt: new Date(),
                    },
                },
            });
            if (!passwordReset) {
                throw new appError_1.AppError("Invalid or expired password reset token", 400, [
                    { path: "token", message: "Invalid or expired password reset token" },
                ]);
            }
            // Hash new password
            const salt = await bcrypt_1.default.genSalt(10);
            const hashedPassword = await bcrypt_1.default.hash(data.password, salt);
            // Update user password
            await prisma_1.prisma.user.update({
                where: { id: decoded.id },
                data: { password_hash: hashedPassword },
            });
            // Delete password reset record
            await prisma_1.prisma.passwordReset.delete({
                where: { userId: decoded.id },
            });
            // Revoke all refresh tokens
            await (0, tokens_1.revokeRefreshToken)(decoded.id);
            return { message: "Password reset successful" };
        }
        catch (error) {
            logger_1.logger.error(`Error in resetPassword: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to reset password", 500);
        }
    }
    static async verifyEmail(token) {
        try {
            // Find email verification record
            const verification = await prisma_1.prisma.emailVerification.findFirst({
                where: {
                    token,
                    expiresAt: {
                        gt: new Date(),
                    },
                },
            });
            if (!verification) {
                throw new appError_1.AppError("Invalid or expired email verification token", 400, [
                    { path: "token", message: "Invalid or expired email verification token" },
                ]);
            }
            // Update user email verification status
            await prisma_1.prisma.user.update({
                where: { id: verification.userId },
                data: { email_verified: true },
            });
            // Delete verification record
            await prisma_1.prisma.emailVerification.delete({
                where: { userId: verification.userId },
            });
            return { message: "Email verified successfully" };
        }
        catch (error) {
            logger_1.logger.error(`Error in verifyEmail: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to verify email", 500);
        }
    }
    static async verifyPhone(code, userId) {
        try {
            // Find phone verification record
            const verification = await prisma_1.prisma.phoneVerification.findFirst({
                where: {
                    userId,
                    code,
                    expiresAt: {
                        gt: new Date(),
                    },
                },
            });
            if (!verification) {
                throw new appError_1.AppError("Invalid or expired phone verification code", 400, [
                    { path: "code", message: "Invalid or expired phone verification code" },
                ]);
            }
            // Update user phone verification status
            await prisma_1.prisma.user.update({
                where: { id: userId },
                data: { phone_verified: true },
            });
            // Delete verification record
            await prisma_1.prisma.phoneVerification.delete({
                where: { userId },
            });
            return { message: "Phone verified successfully" };
        }
        catch (error) {
            logger_1.logger.error(`Error in verifyPhone: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to verify phone", 500);
        }
    }
    static async resendEmailVerification(userId) {
        try {
            // Find user
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new appError_1.AppError("User not found", 404);
            }
            if (user.email_verified) {
                throw new appError_1.AppError("Email already verified", 400);
            }
            // Generate new verification token
            const verificationToken = (0, tokens_1.generateVerificationToken)();
            // Update or create verification record
            await prisma_1.prisma.emailVerification.upsert({
                where: { userId },
                update: {
                    token: verificationToken,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                },
                create: {
                    userId,
                    token: verificationToken,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                },
            });
            // Send verification email
            await email_1.EmailService.sendVerificationEmail(user.email, verificationToken);
            return { message: "Verification email sent" };
        }
        catch (error) {
            logger_1.logger.error(`Error in resendEmailVerification: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to resend verification email", 500);
        }
    }
    static async resendPhoneVerification(userId) {
        try {
            // Find user
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new appError_1.AppError("User not found", 404);
            }
            if (user.phone_verified) {
                throw new appError_1.AppError("Phone already verified", 400);
            }
            // Generate new verification code
            const verificationCode = (0, tokens_1.generatePhoneVerificationCode)();
            // Update or create verification record
            await prisma_1.prisma.phoneVerification.upsert({
                where: { userId },
                update: {
                    code: verificationCode,
                    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
                },
                create: {
                    userId,
                    code: verificationCode,
                    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
                },
            });
            if (!user.phone_number) {
                throw new appError_1.AppError("Phone number not found", 404);
            }
            // Send verification SMS
            if (user.phone_number) {
                await sms_1.SmsService.sendVerificationSms(user.phone_number, verificationCode);
            }
            return { message: "Verification SMS sent" };
        }
        catch (error) {
            logger_1.logger.error(`Error in resendPhoneVerification: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to resend verification SMS", 500);
        }
    }
    static async generateTokensForUser(userId, sessionId) {
        try {
            return await (0, tokens_1.generateAuthTokens)(userId, sessionId);
        }
        catch (error) {
            logger_1.logger.error(`Error generating tokens for user: ${error}`);
            throw new appError_1.AppError("Failed to generate authentication tokens", 500);
        }
    }
    static async validateSession(userId, sessionId) {
        try {
            const session = await prisma_1.prisma.userSession.findUnique({
                where: {
                    id: sessionId,
                    user_id: userId,
                    is_active: true,
                },
            });
            if (!session) {
                throw new appError_1.AppError("Session is invalid or expired", 401);
            }
            // Update last activity timestamp
            await prisma_1.prisma.userSession.update({
                where: { id: sessionId },
                data: { last_activity: new Date() },
            });
            return session;
        }
        catch (error) {
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to validate session", 500);
        }
    }
    static async generateAccessToken(user) {
        return jsonwebtoken_1.default.sign(user, config_1.config.jwt.secret, {
            expiresIn: config_1.config.jwt.accessExpiresIn,
        });
    }
    static async generateRefreshToken(user) {
        return jsonwebtoken_1.default.sign(user, config_1.config.jwt.refreshSecret, {
            expiresIn: config_1.config.jwt.refreshExpiresIn,
        });
    }
    static async VerifyJwtToken(token, secret) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            return decoded;
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new appError_1.AppError("Token expired", 401);
            }
            else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new appError_1.AppError("Invalid token", 401);
            }
            throw new appError_1.AppError("Token verification failed", 401);
        }
    }
    static async setAuthCookies(res, accessToken, refreshToken) {
        try {
            const accessTokenExpiry = Number.parseInt(config_1.config.jwt.accessExpiresIn.toString()) * 1000;
            const refreshTokenExpiry = Number.parseInt(config_1.config.jwt.refreshExpiresIn.toString()) * 1000;
            res.cookie("accessToken", accessToken, (0, authMiddleware_1.getCookieOptions)(accessTokenExpiry));
            res.cookie("refreshToken", refreshToken, (0, authMiddleware_1.getCookieOptions)(refreshTokenExpiry));
        }
        catch (error) {
            logger_1.logger.error(`Failed to set auth cookies: ${error}`);
            throw new appError_1.AppError("Failed to set auth cookies", 500);
        }
    }
    static async clearAuthCookies(res) {
        try {
            res.clearCookie("accessToken", (0, authMiddleware_1.getCookieOptions)(0));
            res.clearCookie("refreshToken", (0, authMiddleware_1.getCookieOptions)(0));
        }
        catch (error) {
            throw new appError_1.AppError("Failed to remove auth cookies", 500);
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=authService.js.map
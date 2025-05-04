import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";
import { EmailService } from "../utils/email";
import { SmsService } from "../utils/sms";
import { logger } from "../utils/logger";
import {
  generateAuthTokens,
  generateVerificationToken,
  generateResetPasswordToken,
  verifyToken,
  TokenType,
  revokeRefreshToken,
  generatePhoneVerificationCode,
  type TokenPayload,
} from "../utils/tokens";
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "../validators/authValidators";
import axios from "axios";
import jwt from "jsonwebtoken";
import type { Response } from "express";
import { getCookieOptions } from "../middleware/authMiddleware";
import { config } from "../config";
import type { Profile } from "passport-google-oauth20";

// Initialize Google OAuth client

export class AuthService {
  static async register(data: RegisterInput) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: data.email }, ...(data.phone_number ? [{ phone_number: data.phone_number }] : [])],
        },
      });

      if (existingUser) {
        if (existingUser.email === data.email) {
          throw new AppError("Email already in use", 400, [{ path: "email", message: "Email already in use" }]);
        }
        if (data.phone_number && existingUser.phone_number === data.phone_number) {
          throw new AppError("Phone number already in use", 400, [
            { path: "phone_number", message: "Phone number already in use" },
          ]);
        }
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);

      // Handle full_name
      const nameParts = [data.first_name, data.last_name];
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

      // Create verification tokens
      const emailVerificationToken = generateVerificationToken();
      const phoneVerificationCode = data.phone_number ? generatePhoneVerificationCode() : null;

      // Create user
      const user = await prisma.user.create({
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

      // Send verification emails and SMS (uncomment when ready)
      // await EmailService.sendVerificationEmail(data.email, emailVerificationToken);
      // if (data.phone_number && phoneVerificationCode) {
      //   await SmsService.sendVerificationSms(data.phone_number, phoneVerificationCode);
      // }

      // Create new UserSession
      const userSession = await prisma.userSession.create({
        data: {
          user_id: user.id,
        },
      });

      // Generate JWT tokens
      const { accessToken, refreshToken } = await generateAuthTokens(user.id, userSession.id);

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
    } catch (error) {
      logger.error(`Error in register: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to register user", 500);
    }
  }

  static async login(data: LoginInput) {
    try {
      // Find user by email or phone number
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            ...(data.email ? [{ email: data.email }] : []),
            ...(data.phone_number ? [{ phone_number: data.phone_number }] : []),
          ],
        },
      });

      if (!user) {
        throw new AppError("Invalid credentials", 401, [{ path: "email", message: "Invalid credentials" }]);
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(data.password, user.password_hash);
      if (!isPasswordValid) {
        throw new AppError("Invalid credentials", 401, [{ path: "password", message: "Invalid credentials" }]);
      }

      // Create new UserSession
      const userSession = await prisma.userSession.create({
        data: {
          user_id: user.id,
        },
      });

      // Generate JWT tokens
      const { accessToken, refreshToken } = await generateAuthTokens(user.id, userSession.id);

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
    } catch (error) {
      logger.error(`Error in login: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to login", 500);
    }
  }

  static async googleLogin(profile:Profile) {
    try {
      // Check if user exists
      let user = await prisma.user.findFirst({
        where: {
          email: profile.emails?.[0].value,
        },
      });

      if (!user) {
        // Create new user
        user = await prisma.user.create({
          data: {
            email: profile.emails?.[0].value as string,
            first_name: profile.name?.givenName || "Google",
            last_name: profile.name?.familyName || "User",
            phone_number: `google_${Date.now()}`, // Placeholder
            password_hash: crypto.randomBytes(16).toString("hex"), // Random password
            role: "USER",
            email_verified: true,
            Profile: {
              create: {
                bio: "",
                theme: "light",
                language: "en",
                profile_picture: profile.photos?.[0].value,
              },
            },
            socialLogins: {
              create: {
                provider: "GOOGLE",
                providerId: profile.id,
              },
            },
          },
        });
      } else {
        // Check if social login exists
        const socialLogin = await prisma.socialLogin.findFirst({
          where: {
            userId: user.id,
            provider: "GOOGLE",
          },
        });

        if (!socialLogin) {
          await prisma.socialLogin.create({
            data: {
              userId: user.id,
              provider: "GOOGLE",
              providerId: profile.id,
            },
          });
        }
      }

      return {...user,hello:"hi"}
    } catch (error) {
      logger.error(`Error in googleLogin: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to login with Google", 500);
    }
  }

  static async facebookLogin(accessToken: string) {
    try {
      // Verify Facebook access token
      const response = await axios.get(
        `https://graph.facebook.com/me?fields=id,name,email,first_name,last_name,picture&access_token=${accessToken}`
      );

      const { id, email, first_name, last_name, picture } = response.data;

      if (!email) {
        throw new AppError("Email not provided by Facebook", 400);
      }

      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Create new user
        user = await prisma.user.create({
          data: {
            email,
            first_name: first_name || "Facebook",
            last_name: last_name || "User",
            phone_number: `facebook_${Date.now()}`, // Placeholder
            password_hash: crypto.randomBytes(16).toString("hex"), // Random password
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
      } else {
        // Check if social login exists
        const socialLogin = await prisma.socialLogin.findFirst({
          where: {
            userId: user.id,
            provider: "FACEBOOK",
          },
        });

        if (!socialLogin) {
          // Add social login
          await prisma.socialLogin.create({
            data: {
              userId: user.id,
              provider: "FACEBOOK",
              providerId: id,
            },
          });
        }
      }

      return user;
    } catch (error) {
      logger.error(`Error in facebookLogin: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to login with Facebook", 500);
    }
  }

  static async appleLogin(idToken: string, firstName?: string, lastName?: string) {
    try {
      // Parse and verify Apple ID token (in a real implementation, verify with Apple's servers)
      const payload = JSON.parse(Buffer.from(idToken.split(".")[1], "base64").toString());

      if (!payload.email) {
        throw new AppError("Email not provided by Apple", 400);
      }

      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { email: payload.email },
      });

      if (!user) {
        // Create new user
        user = await prisma.user.create({
          data: {
            email: payload.email,
            first_name: firstName || payload.given_name || "Apple",
            last_name: lastName || payload.family_name || "User",
            phone_number: `apple_${Date.now()}`, // Placeholder
            password_hash: crypto.randomBytes(16).toString("hex"), // Random password
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
      } else {
        // Check if social login exists
        const socialLogin = await prisma.socialLogin.findFirst({
          where: {
            userId: user.id,
            provider: "APPLE",
          },
        });

        if (!socialLogin) {
          // Add social login
          await prisma.socialLogin.create({
            data: {
              userId: user.id,
              provider: "APPLE",
              providerId: payload.sub,
            },
          });
        }
      }

      return user;
    } catch (error) {
      logger.error(`Error in appleLogin: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to login with Apple", 500);
    }
  }

  

  static async logout(userId: string, sessionId?: string, allDevices = false) {
    try {
      if (allDevices) {
        // Revoke all sessions for the user
        await prisma.userSession.deleteMany({
          where: { user_id: userId },
        });
      } else if (sessionId) {
        // Revoke specific session
        await prisma.userSession.delete({
          where: { id: sessionId, user_id: userId },
        });
      } else {
        // Revoke all sessions except current
        await prisma.userSession.deleteMany({
          where: {
            user_id: userId,
            id: { not: sessionId },
          },
        });
      }

      // Revoke refresh token
      await revokeRefreshToken(userId);

      return { message: "Logged out successfully" };
    } catch (error) {
      logger.error(`Error in logout: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to logout", 500);
    }
  }

  static async logoutCurrentSession(userId: string, sessionId: string) {
    return this.logout(userId, sessionId);
  }

  static async logoutOtherDevices(userId: string, currentSessionId: string) {
    return this.logout(userId, currentSessionId);
  }

  static async logoutAllDevices(userId: string) {
    return this.logout(userId, undefined, true);
  }

  static async forgotPassword(data: ForgotPasswordInput) {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (!user) {
        return {
          message: "If a user with that email exists, a password reset link has been sent",
        };
      }

      // Generate reset token
      const resetToken = generateResetPasswordToken(user.id);

      // Store reset token in database
      await prisma.passwordReset.upsert({
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
      await EmailService.sendPasswordResetEmail(data.email, resetToken);

      return {
        message: "If a user with that email exists, a password reset link has been sent",
      };
    } catch (error) {
      logger.error(`Error in forgotPassword: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to process forgot password request", 500);
    }
  }

  static async resetPassword(data: ResetPasswordInput) {
    try {
      // Verify reset token
      const decoded = verifyToken<TokenPayload>(data.token, TokenType.RESET_PASSWORD);

      // Find password reset record
      const passwordReset = await prisma.passwordReset.findFirst({
        where: {
          userId: decoded.id,
          token: data.token,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!passwordReset) {
        throw new AppError("Invalid or expired password reset token", 400, [
          { path: "token", message: "Invalid or expired password reset token" },
        ]);
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);

      // Update user password
      await prisma.user.update({
        where: { id: decoded.id },
        data: { password_hash: hashedPassword },
      });

      // Delete password reset record
      await prisma.passwordReset.delete({
        where: { userId: decoded.id },
      });

      // Revoke all refresh tokens
      await revokeRefreshToken(decoded.id);

      return { message: "Password reset successful" };
    } catch (error) {
      logger.error(`Error in resetPassword: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to reset password", 500);
    }
  }

  static async verifyEmail(token: string) {
    try {
      // Find email verification record
      const verification = await prisma.emailVerification.findFirst({
        where: {
          token,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!verification) {
        throw new AppError("Invalid or expired email verification token", 400, [
          { path: "token", message: "Invalid or expired email verification token" },
        ]);
      }

      // Update user email verification status
      await prisma.user.update({
        where: { id: verification.userId },
        data: { email_verified: true },
      });

      // Delete verification record
      await prisma.emailVerification.delete({
        where: { userId: verification.userId },
      });

      return { message: "Email verified successfully" };
    } catch (error) {
      logger.error(`Error in verifyEmail: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to verify email", 500);
    }
  }

  static async verifyPhone(code: string, userId: string) {
    try {
      // Find phone verification record
      const verification = await prisma.phoneVerification.findFirst({
        where: {
          userId,
          code,
          expiresAt: {
            gt: new Date(),
          },
        },
      });

      if (!verification) {
        throw new AppError("Invalid or expired phone verification code", 400, [
          { path: "code", message: "Invalid or expired phone verification code" },
        ]);
      }

      // Update user phone verification status
      await prisma.user.update({
        where: { id: userId },
        data: { phone_verified: true },
      });

      // Delete verification record
      await prisma.phoneVerification.delete({
        where: { userId },
      });

      return { message: "Phone verified successfully" };
    } catch (error) {
      logger.error(`Error in verifyPhone: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to verify phone", 500);
    }
  }

  static async resendEmailVerification(userId: string) {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new AppError("User not found", 404);
      }

      if (user.email_verified) {
        throw new AppError("Email already verified", 400);
      }

      // Generate new verification token
      const verificationToken = generateVerificationToken();

      // Update or create verification record
      await prisma.emailVerification.upsert({
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
      await EmailService.sendVerificationEmail(user.email, verificationToken);

      return { message: "Verification email sent" };
    } catch (error) {
      logger.error(`Error in resendEmailVerification: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to resend verification email", 500);
    }
  }

  static async resendPhoneVerification(userId: string) {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new AppError("User not found", 404);
      }

      if (user.phone_verified) {
        throw new AppError("Phone already verified", 400);
      }

      // Generate new verification code
      const verificationCode = generatePhoneVerificationCode();

      // Update or create verification record
      await prisma.phoneVerification.upsert({
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
        throw new AppError("Phone number not found", 404);
      }

      // Send verification SMS
      if (user.phone_number) {
        await SmsService.sendVerificationSms(user.phone_number, verificationCode);
      }

      return { message: "Verification SMS sent" };
    } catch (error) {
      logger.error(`Error in resendPhoneVerification: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to resend verification SMS", 500);
    }
  }

  static async generateTokensForUser(userId: string, sessionId: string) {
    try {
      return await generateAuthTokens(userId, sessionId);
    } catch (error) {
      logger.error(`Error generating tokens for user: ${error}`);
      throw new AppError("Failed to generate authentication tokens", 500);
    }
  }

  static async validateSession(userId: string, sessionId: string): Promise<any> {
    try {
      const session = await prisma.userSession.findUnique({
        where: {
          id: sessionId,
          user_id: userId,
          is_active: true,
        },
      });

      if (!session) {
        throw new AppError("Session is invalid or expired", 401);
      }

      // Update last activity timestamp
      await prisma.userSession.update({
        where: { id: sessionId },
        data: { last_activity: new Date() },
      });

      return session;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to validate session", 500);
    }
  }

  static async generateAccessToken(user: TokenPayload): Promise<string> {
    return jwt.sign(user, config.jwt.secret, {
      expiresIn: config.jwt.accessExpiresIn as any,
    });
  }

  static async generateRefreshToken(user: TokenPayload): Promise<string> {
    return jwt.sign(user, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn as any,
    });
  }

  static async VerifyJwtToken(token: string, secret: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, secret);
      return decoded as TokenPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError("Token expired", 401);
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError("Invalid token", 401);
      }
      throw new AppError("Token verification failed", 401);
    }
  }

  static async setAuthCookies(res: Response, accessToken: string, refreshToken: string): Promise<void> {
    try {
      res.cookie("accessToken", accessToken, getCookieOptions());
      res.cookie("refreshToken", refreshToken, getCookieOptions());
    } catch (error) {
      logger.error(`Failed to set auth cookies: ${error}`);
      throw new AppError("Failed to set auth cookies", 500);
    }
  }

  static async clearAuthCookies(res: Response) {
    try {
      res.clearCookie("accessToken", getCookieOptions(0));
      res.clearCookie("refreshToken", getCookieOptions(0));
    } catch (error) {
      throw new AppError("Failed to remove auth cookies", 500);
    }
  }
}
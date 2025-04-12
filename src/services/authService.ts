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
} from "../utils/tokens";
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  SocialLoginInput,
} from "../validators/authValidators";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class AuthService {
  static async register(data: RegisterInput) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: data.email },
            // { phone_number: data.phone_number }
          ],
        },
      });

      if (existingUser) {
        if (existingUser.email === data.email) {
          throw new AppError("Email already in use", 400, [
            { path: "email", message: "Email already in use" },
          ]);
        }
        // if (existingUser.phone_number === data.phone_number) {
        //   throw new AppError("Phone number already in use", 400, [
        //     { path: "phone_number", message: "Phone number already in use" },
        //   ]);
        // }
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);

      // Create verification tokens
      const emailVerificationToken = generateVerificationToken(
        existingUser ? existingUser.id : ""
      );
      const phoneVerificationCode = generatePhoneVerificationCode();

      // Create user
      const user = await prisma.user.create({
        data: {
          full_name: data.full_name,
          // last_name: data.last_name,
          email: data.email,
          // phone_number: data.phone_number,
          password_hash: hashedPassword,
          // role: data.role,
          // date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : null,
          // address: data.address,
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
          phoneVerification: {
            create: {
              code: phoneVerificationCode,
              expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
            },
          },
        },
      });

      // Send verification emails and SMS
      await EmailService.sendVerificationEmail(data.email, emailVerificationToken);
      if (user?.phone_number) {
        await SmsService.sendVerificationSms(user.phone_number, phoneVerificationCode);
      }

      // Generate JWT tokens
      const { accessToken, refreshToken } = await generateAuthTokens(user.id);

      return {
        user: {
          id: user.id,
          full_name: user.full_name,
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
      console.log({ data });
      // Check if the user is attempting to log in with an email or phone number
      let user;
      if (data.email) {
        // Find user by email
        user = await prisma.user.findUnique({
          where: { email: data.email },
        });
      } else if (data.phone_number) {
        // Find user by phone number
        user = await prisma.user.findUnique({
          where: { phone_number: data.phone_number },
        });
      }

      if (!user) {
        throw new AppError("Invalid email or phone number or password", 401, [
          { path: "email", message: "Invalid email or phone number or password" },
        ]);
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(data.password, user.password_hash);
      if (!isPasswordValid) {
        throw new AppError("Invalid email or phone number or password", 401, [
          { path: "password", message: "Invalid email or phone number or password" },
        ]);
      }

      // Generate JWT tokens
      const { accessToken, refreshToken } = await generateAuthTokens(user.id);

      return {
        user: {
          id: user.id,
          full_name: user.full_name,
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

  static async googleLogin(idToken: string) {
    try {
      // Verify Google ID token
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new AppError("Invalid Google token", 400);
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
            full_name: payload.given_name || "Google",
            last_name: payload.family_name || "User",
            phone_number: `google_${Date.now()}`, // Placeholder
            password_hash: crypto.randomBytes(16).toString("hex"), // Random password
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
                providerId: payload.sub!,
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
          // Add social login
          await prisma.socialLogin.create({
            data: {
              userId: user.id,
              provider: "GOOGLE",
              providerId: payload.sub!,
            },
          });
        }
      }

      // Generate JWT tokens
      const { accessToken, refreshToken } = await generateAuthTokens(user.id);

      return {
        user: {
          id: user.id,
          full_name: user.full_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
        },
        accessToken,
        refreshToken,
      };
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
        `https://graph.facebook.com/me?fields=id,name,email,full_name,last_name,picture&access_token=${accessToken}`
      );

      const { id, email, full_name, last_name, picture } = response.data;

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
            full_name: full_name || "Facebook",
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

      // Generate JWT tokens
      const { accessToken: jwt, refreshToken } = await generateAuthTokens(user.id);

      return {
        user: {
          id: user.id,
          full_name: user.full_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
        },
        accessToken: jwt,
        refreshToken,
      };
    } catch (error) {
      logger.error(`Error in facebookLogin: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to login with Facebook", 500);
    }
  }

  static async appleLogin(idToken: string) {
    try {
      // In a real implementation, you would verify the Apple ID token
      // This is a simplified version

      // Parse the token (in a real implementation, you would verify it with Apple)
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
            full_name: payload.given_name || "Apple",
            last_name: payload.family_name || "User",
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

      // Generate JWT tokens
      const { accessToken, refreshToken } = await generateAuthTokens(user.id);

      return {
        user: {
          id: user.id,
          full_name: user.full_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error(`Error in appleLogin: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to login with Apple", 500);
    }
  }

  static async socialLogin(data: SocialLoginInput) {
    try {
      switch (data.provider) {
        case "GOOGLE":
          return await this.googleLogin(data.token);
        case "FACEBOOK":
          return await this.facebookLogin(data.token);
        case "APPLE":
          return await this.appleLogin(data.token);
        default:
          throw new AppError("Unsupported social login provider", 400);
      }
    } catch (error) {
      logger.error(`Error in socialLogin: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to login with social provider", 500);
    }
  }

  static async logout(userId: string) {
    try {
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

  static async forgotPassword(data: ForgotPasswordInput) {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (!user) {
        // Don't reveal that the user doesn't exist for security reasons
        return {
          message:
            "If a user with that email exists, a password reset link has been sent",
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
      const decoded = verifyToken<{ id: string; type: TokenType }>(
        data.token,
        TokenType.RESET_PASSWORD
      );

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
      const verificationToken = generateVerificationToken(userId);

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

      // Send verification SMS
      if (!user.phone_number) {
        throw new AppError("Phone number not found", 404);
      }
      await SmsService.sendVerificationSms(user?.phone_number, verificationCode);

      return { message: "Verification SMS sent" };
    } catch (error) {
      logger.error(`Error in resendPhoneVerification: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to resend verification SMS", 500);
    }
  }

  static async generateTokensForUser(userId: string) {
    try {
      return await generateAuthTokens(userId);
    } catch (error) {
      logger.error(`Error generating tokens for user: ${error}`);
      throw new AppError("Failed to generate authentication tokens", 500);
    }
  }
}

import type { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authService";
import { catchAsync } from "../utils/catchAsync";
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyEmailInput,
  VerifyPhoneInput,
  SocialLoginInput,
} from "../validators/authValidators";
import { AppError } from "../utils/appError";
import { config } from "../config";

export class AuthController {
  static register = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const data = req.body as RegisterInput;
      const result = await AuthService.register(data);

      // Set cookies if enabled
      if (config.auth.useCookieAuth === true) {
        await AuthService.setAuthCookies(res, result.accessToken, result.refreshToken);
      }

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: result.user,
          ...(config.auth.useCookieAuth !== true && {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          }),
        },
      });
    }
  );

  static login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body as LoginInput;
    const result = await AuthService.login(data);

    // Set cookies if enabled
    if (config.auth.useCookieAuth === true) {
      await AuthService.setAuthCookies(res, result.accessToken, result.refreshToken);
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: result.user,
        ...(config.auth.useCookieAuth !== true && {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        }),
      },
    });
  });

  static forgotPassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const data = req.body as ForgotPasswordInput;
      const result = await AuthService.forgotPassword(data);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    }
  );

  static resetPassword = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const data = req.body as ResetPasswordInput;
      const result = await AuthService.resetPassword(data);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    }
  );

  static verifyEmail = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const data = req.body as VerifyEmailInput;
      const result = await AuthService.verifyEmail(data.token);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    }
  );

  static verifyPhone = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(
          new AppError("You must be logged in to verify your phone number", 401)
        );
      }

      const data = req.body as VerifyPhoneInput;
      const result = await AuthService.verifyPhone(data.code, req.user.id);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    }
  );

  static socialLogin = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const data = req.body as SocialLoginInput;
      const result = await AuthService.socialLogin(data);

      // Set cookies if enabled
      if (config.auth.useCookieAuth === true) {
        await AuthService.setAuthCookies(res, result.accessToken, result.refreshToken);
      }

      res.status(200).json({
        success: true,
        message: "Social login successful",
        data: {
          user: result.user,
          ...(config.auth.useCookieAuth !== true && {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          }),
        },
      });
    }
  );

  static logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.sessionId) {
      return next(new AppError("Not logged in", 401));
    }

    await AuthService.logoutCurrentSession(req.user.id, req.sessionId);
    await AuthService.clearAuthCookies(res);

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  });

  static logoutOtherDevices = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user || !req.sessionId) {
        return next(new AppError("Not logged in", 401));
      }

      await AuthService.logoutOtherDevices(req.user.id, req.sessionId);
      res.status(200).json({
        success: true,
        message: "Logged out from other devices successfully",
      });
    }
  );

  static logoutAllDevices = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return next(new AppError("Not logged in", 401));
      }

      await AuthService.logoutAllDevices(req.user.id);
      await AuthService.clearAuthCookies(res);

      res.status(200).json({
        success: true,
        message: "Logged out from all devices successfully",
      });
    }
  );

  static refreshToken = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;

      if (!refreshToken) {
        return next(new AppError("Refresh token is required", 400));
      }

      if (!req.user || !req.sessionId) {
        return next(new AppError("Not logged in", 401));
      }

      const tokens = await AuthService.generateTokensForUser(req?.user.id, req.sessionId);

      if (config.auth.useCookieAuth === true) {
        await AuthService.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
      }

      res.status(200).json({
        success: true,
        message: "Tokens refreshed successfully",
        data: {
          ...(config.auth.useCookieAuth !== true && {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          }),
        },
      });
    }
  );

  static socialAuthCallback = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user || !req.sessionId) {
        return next(new AppError("Authentication failed", 401));
      }

      const { accessToken, refreshToken } = await AuthService.generateTokensForUser(
        req.user.id,
        req.sessionId
      );

      if (config.auth.useCookieAuth === true) {
        await AuthService.setAuthCookies(res, accessToken, refreshToken);
        return res.redirect(`${process.env.FRONTEND_URL}/auth/success`);
      }

      res.redirect(
        `${process.env.FRONTEND_URL}/auth/success?accessToken=${accessToken}&refreshToken=${refreshToken}`
      );
    }
  );
}

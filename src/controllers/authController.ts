import type { Request, Response, NextFunction } from "express"
import { AuthService } from "../services/authService"
import { catchAsync } from "../utils/catchAsync"
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyEmailInput,
  VerifyPhoneInput,
  SocialLoginInput,
} from "../validators/authValidators"
import { setTokenCookies, clearTokenCookies } from "../middleware/authMiddleware"
import { AppError } from "../utils/appError"
import { refreshTokens } from "../utils/tokens"

export class AuthController {
  static register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body as RegisterInput
    const result = await AuthService.register(data)

    // Set cookies if enabled
    if (process.env.USE_COOKIE_AUTH === "true") {
      setTokenCookies(res, result.accessToken, result.refreshToken)
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: result.user,
        ...(process.env.USE_COOKIE_AUTH !== "true" && {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        }),
      },
    })
  })

  static login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body as LoginInput
    const result = await AuthService.login(data)

    // Set cookies if enabled
    if (process.env.USE_COOKIE_AUTH === "true") {
      setTokenCookies(res, result.accessToken, result.refreshToken)
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: result.user,
        ...(process.env.USE_COOKIE_AUTH !== "true" && {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        }),
      },
    })
  })

  static forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body as ForgotPasswordInput
    const result = await AuthService.forgotPassword(data)

    res.status(200).json({
      success: true,
      message: result.message,
    })
  })

  static resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body as ResetPasswordInput
    const result = await AuthService.resetPassword(data)

    res.status(200).json({
      success: true,
      message: result.message,
    })
  })

  static verifyEmail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body as VerifyEmailInput
    const result = await AuthService.verifyEmail(data.token)

    res.status(200).json({
      success: true,
      message: result.message,
    })
  })

  static verifyPhone = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("You must be logged in to verify your phone number", 401))
    }

    const data = req.body as VerifyPhoneInput
    const result = await AuthService.verifyPhone(data.code, req.user.id)

    res.status(200).json({
      success: true,
      message: result.message,
    })
  })

  static socialLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body as SocialLoginInput
    const result = await AuthService.socialLogin(data)

    // Set cookies if enabled
    if (process.env.USE_COOKIE_AUTH === "true") {
      setTokenCookies(res, result.accessToken, result.refreshToken)
    }

    res.status(200).json({
      success: true,
      message: "Social login successful",
      data: {
        user: result.user,
        ...(process.env.USE_COOKIE_AUTH !== "true" && {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        }),
      },
    })
  })

  static logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (req.user) {
      await AuthService.logout(req.user.id)
    }

    // Clear cookies
    clearTokenCookies(res)

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    })
  })

  static refreshToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Get refresh token from request body or cookie
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken

    if (!refreshToken) {
      return next(new AppError("Refresh token is required", 400))
    }

    const tokens = await refreshTokens(refreshToken)

    // Set cookies if enabled
    if (process.env.USE_COOKIE_AUTH === "true") {
      setTokenCookies(res, tokens.accessToken, tokens.refreshToken)
    }

    res.status(200).json({
      success: true,
      message: "Tokens refreshed successfully",
      data: {
        ...(process.env.USE_COOKIE_AUTH !== "true" && {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        }),
      },
    })
  })

  static socialAuthCallback = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // User will be attached to req by passport
    if (!req.user) {
      return next(new AppError("Authentication failed", 401))
    }

    // Generate tokens
    const { accessToken, refreshToken } = await AuthService.generateTokensForUser(req.user.id)

    // Set cookies if enabled
    if (process.env.USE_COOKIE_AUTH === "true") {
      setTokenCookies(res, accessToken, refreshToken)

      // Redirect to frontend with success
      return res.redirect(`${process.env.FRONTEND_URL}/auth/success`)
    }

    // If not using cookies, redirect with tokens as query params
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?accessToken=${accessToken}&refreshToken=${refreshToken}`)
  })
}

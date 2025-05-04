import express from "express"
import { AuthController } from "../controllers/authController"
import { validateRequest } from "../middleware/validateRequest"
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  verifyPhoneSchema,
} from "../validators/authValidators"
import passport from "passport"
import { protect } from "../middleware/authMiddleware"

const router = express.Router()

// Regular auth routes
router.post("/register", validateRequest({ body: registerSchema }), AuthController.register)
router.post("/login", validateRequest({ body: loginSchema }), AuthController.login)
router.post("/forgot-password", validateRequest({ body: forgotPasswordSchema }), AuthController.forgotPassword)
router.post("/reset-password", validateRequest({ body: resetPasswordSchema }), AuthController.resetPassword)
router.post("/verify-email", validateRequest({ body: verifyEmailSchema }), AuthController.verifyEmail)
router.post("/verify-phone", protect, validateRequest({ body: verifyPhoneSchema }), AuthController.verifyPhone)
router.post("/refresh-token", AuthController.refreshToken)

// Protected logout routes
router.post("/logout", protect, AuthController.logout)
router.post("/logout-other-devices", protect, AuthController.logoutOtherDevices)
router.post("/logout-all-devices", protect, AuthController.logoutAllDevices)

// Google OAuth routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }))

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
  AuthController.socialAuthCallback,
)

// Facebook OAuth routes
router.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }))

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
  AuthController.socialAuthCallback,
)

// Apple OAuth routes
router.get("/apple", passport.authenticate("apple", { scope: ["name", "email"] }))

router.post(
  "/apple/callback",
  passport.authenticate("apple", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
  AuthController.socialAuthCallback,
)

export { router as authRoutes }

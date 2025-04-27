"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const validateRequest_1 = require("../middleware/validateRequest");
const authValidators_1 = require("../validators/authValidators");
const passport_1 = __importDefault(require("passport"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
exports.authRoutes = router;
// Regular auth routes
router.post("/register", (0, validateRequest_1.validateRequest)({ body: authValidators_1.registerSchema }), authController_1.AuthController.register);
router.post("/login", (0, validateRequest_1.validateRequest)({ body: authValidators_1.loginSchema }), authController_1.AuthController.login);
router.post("/forgot-password", (0, validateRequest_1.validateRequest)({ body: authValidators_1.forgotPasswordSchema }), authController_1.AuthController.forgotPassword);
router.post("/reset-password", (0, validateRequest_1.validateRequest)({ body: authValidators_1.resetPasswordSchema }), authController_1.AuthController.resetPassword);
router.post("/verify-email", (0, validateRequest_1.validateRequest)({ body: authValidators_1.verifyEmailSchema }), authController_1.AuthController.verifyEmail);
router.post("/verify-phone", authMiddleware_1.protect, (0, validateRequest_1.validateRequest)({ body: authValidators_1.verifyPhoneSchema }), authController_1.AuthController.verifyPhone);
router.post("/social-login", (0, validateRequest_1.validateRequest)({ body: authValidators_1.socialLoginSchema }), authController_1.AuthController.socialLogin);
router.post("/refresh-token", authController_1.AuthController.refreshToken);
// Protected logout routes
router.post("/logout", authMiddleware_1.protect, authController_1.AuthController.logout);
router.post("/logout-other-devices", authMiddleware_1.protect, authController_1.AuthController.logoutOtherDevices);
router.post("/logout-all-devices", authMiddleware_1.protect, authController_1.AuthController.logoutAllDevices);
// Google OAuth routes
router.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport_1.default.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
}), authController_1.AuthController.socialAuthCallback);
// Facebook OAuth routes
router.get("/facebook", passport_1.default.authenticate("facebook", { scope: ["email"] }));
router.get("/facebook/callback", passport_1.default.authenticate("facebook", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
}), authController_1.AuthController.socialAuthCallback);
// Apple OAuth routes
router.get("/apple", passport_1.default.authenticate("apple", { scope: ["name", "email"] }));
router.post("/apple/callback", passport_1.default.authenticate("apple", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
}), authController_1.AuthController.socialAuthCallback);
//# sourceMappingURL=authRoutes.js.map
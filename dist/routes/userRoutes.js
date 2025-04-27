"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validateRequest_1 = require("../middleware/validateRequest");
const userValidators_1 = require("../validators/userValidators");
const fileUpload_1 = require("../utils/fileUpload");
const router = express_1.default.Router();
exports.userRoutes = router;
// Protect all routes
router.use(authMiddleware_1.protect);
router.get("/profile", userController_1.UserController.getProfile);
router.put("/profile", (0, validateRequest_1.validateRequest)({ body: userValidators_1.updateProfileSchema }), userController_1.UserController.updateProfile);
router.put("/password", (0, validateRequest_1.validateRequest)({ body: userValidators_1.updatePasswordSchema }), userController_1.UserController.updatePassword);
router.post("/profile-picture", fileUpload_1.uploadSingleFile, userController_1.UserController.uploadProfilePicture);
router.post("/addresses", (0, validateRequest_1.validateRequest)({ body: userValidators_1.addAddressSchema }), userController_1.UserController.addAddress);
router.get("/addresses", userController_1.UserController.getAddresses);
router.delete("/addresses/:id", userController_1.UserController.deleteAddress);
//# sourceMappingURL=userRoutes.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoutes = void 0;
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controllers/adminController");
const destinationController_1 = require("../controllers/destinationController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validateRequest_1 = require("../middleware/validateRequest");
const destinationValidators_1 = require("../validators/destinationValidators");
const fileUpload_1 = require("../utils/fileUpload");
const adminValidators_1 = require("../validators/adminValidators");
const commonValidators_1 = require("../validators/commonValidators");
const router = express_1.default.Router();
exports.adminRoutes = router;
// All routes are protected and restricted to admin
router.use(authMiddleware_1.protect);
router.use((0, authMiddleware_1.restrictTo)("ADMIN"));
// User management
router.get("/users", (0, validateRequest_1.validateRequest)({ query: adminValidators_1.userQuerySchema }), adminController_1.AdminController.getUsers);
router.get("/users/:id", (0, validateRequest_1.validateRequest)({ params: commonValidators_1.idParamSchema }), adminController_1.AdminController.getUserById);
router.put("/users/:id/role", (0, validateRequest_1.validateRequest)({
    params: commonValidators_1.idParamSchema,
    body: adminValidators_1.updateUserRoleSchema,
}), adminController_1.AdminController.updateUserRole);
router.delete("/users/:id", (0, validateRequest_1.validateRequest)({ params: commonValidators_1.idParamSchema }), adminController_1.AdminController.deleteUser);
// Dashboard analytics
router.get("/stats", adminController_1.AdminController.getStats);
router.get("/analytics", (0, validateRequest_1.validateRequest)({ query: adminValidators_1.analyticsQuerySchema }), adminController_1.AdminController.getAnalytics);
// System settings
router.get("/settings", adminController_1.AdminController.getSystemSettings);
router.put("/settings", (0, validateRequest_1.validateRequest)({ body: adminValidators_1.systemSettingsSchema }), adminController_1.AdminController.updateSystemSettings);
// Content management - Destinations
router.get("/destinations", adminController_1.AdminController.getAllDestinations);
router.post("/destinations", fileUpload_1.uploadMultipleFiles, (0, validateRequest_1.validateRequest)({ body: destinationValidators_1.destinationSchema }), destinationController_1.DestinationController.createDestination);
router.get("/destinations/:id", (0, validateRequest_1.validateRequest)({ params: commonValidators_1.idParamSchema }), destinationController_1.DestinationController.getDestinationById);
router.put("/destinations/:id", fileUpload_1.uploadMultipleFiles, (0, validateRequest_1.validateRequest)({
    params: commonValidators_1.idParamSchema,
    body: destinationValidators_1.destinationSchema,
}), destinationController_1.DestinationController.updateDestination);
router.delete("/destinations/:id", (0, validateRequest_1.validateRequest)({ params: commonValidators_1.idParamSchema }), destinationController_1.DestinationController.deleteDestination);
//# sourceMappingURL=adminRoutes.js.map
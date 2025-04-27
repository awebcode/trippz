"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.travelAgencyRoutes = void 0;
const express_1 = __importDefault(require("express"));
const travelAgencyController_1 = require("../controllers/travelAgencyController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validateRequest_1 = require("../middleware/validateRequest");
const travelAgencyValidators_1 = require("../validators/travelAgencyValidators");
const fileUpload_1 = require("../utils/fileUpload");
const router = express_1.default.Router();
exports.travelAgencyRoutes = router;
// All routes are protected
router.use(authMiddleware_1.protect);
// Register as travel agency
router.post("/register", (0, validateRequest_1.validateRequest)({ body: travelAgencyValidators_1.travelAgencyProfileSchema }), travelAgencyController_1.TravelAgencyController.register);
// Get travel agency profile
router.get("/profile", (0, authMiddleware_1.restrictTo)("TRAVEL_AGENCY"), travelAgencyController_1.TravelAgencyController.getProfile);
// Update travel agency profile
router.put("/profile", (0, authMiddleware_1.restrictTo)("TRAVEL_AGENCY"), (0, validateRequest_1.validateRequest)({ body: travelAgencyValidators_1.travelAgencyProfileSchema }), travelAgencyController_1.TravelAgencyController.updateProfile);
// Create a new package
router.post("/packages", (0, authMiddleware_1.restrictTo)("TRAVEL_AGENCY"), fileUpload_1.uploadMultipleFiles, (0, validateRequest_1.validateRequest)({ body: travelAgencyValidators_1.travelPackageSchema }), travelAgencyController_1.TravelAgencyController.createPackage);
// Get all packages
router.get("/packages", (0, authMiddleware_1.restrictTo)("TRAVEL_AGENCY"), travelAgencyController_1.TravelAgencyController.getPackages);
// Get package by ID
router.get("/packages/:id", (0, authMiddleware_1.restrictTo)("TRAVEL_AGENCY"), travelAgencyController_1.TravelAgencyController.getPackageById);
// Update package
router.put("/packages/:id", (0, authMiddleware_1.restrictTo)("TRAVEL_AGENCY"), fileUpload_1.uploadMultipleFiles, (0, validateRequest_1.validateRequest)({ body: travelAgencyValidators_1.travelPackageSchema }), travelAgencyController_1.TravelAgencyController.updatePackage);
// Delete package
router.delete("/packages/:id", (0, authMiddleware_1.restrictTo)("TRAVEL_AGENCY"), travelAgencyController_1.TravelAgencyController.deletePackage);
// Get all orders
router.get("/orders", (0, authMiddleware_1.restrictTo)("TRAVEL_AGENCY"), travelAgencyController_1.TravelAgencyController.getOrders);
// Respond to order
router.post("/respond/:orderId", (0, authMiddleware_1.restrictTo)("TRAVEL_AGENCY"), (0, validateRequest_1.validateRequest)({ body: travelAgencyValidators_1.packageResponseSchema }), travelAgencyController_1.TravelAgencyController.respondToOrder);
//# sourceMappingURL=travelAgencyRoutes.js.map
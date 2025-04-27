"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceProviderRoutes = void 0;
const express_1 = __importDefault(require("express"));
const serviceProviderController_1 = require("../controllers/serviceProviderController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validateRequest_1 = require("../middleware/validateRequest");
const serviceProviderValidators_1 = require("../validators/serviceProviderValidators");
const fileUpload_1 = require("../utils/fileUpload");
const router = express_1.default.Router();
exports.serviceProviderRoutes = router;
// All routes are protected
router.use(authMiddleware_1.protect);
// Register as service provider
router.post("/register", (0, validateRequest_1.validateRequest)({ body: serviceProviderValidators_1.serviceProviderProfileSchema }), serviceProviderController_1.ServiceProviderController.register);
// Get service provider profile
router.get("/profile", (0, authMiddleware_1.restrictTo)("SERVICE_PROVIDER"), serviceProviderController_1.ServiceProviderController.getProfile);
// Update service provider profile
router.put("/profile", (0, authMiddleware_1.restrictTo)("SERVICE_PROVIDER"), (0, validateRequest_1.validateRequest)({ body: serviceProviderValidators_1.serviceProviderProfileSchema }), serviceProviderController_1.ServiceProviderController.updateProfile);
// Create a new service
router.post("/services", (0, authMiddleware_1.restrictTo)("SERVICE_PROVIDER"), fileUpload_1.uploadMultipleFiles, (0, validateRequest_1.validateRequest)({ body: serviceProviderValidators_1.serviceSchema }), serviceProviderController_1.ServiceProviderController.createService);
// Get all services
router.get("/services", (0, authMiddleware_1.restrictTo)("SERVICE_PROVIDER"), serviceProviderController_1.ServiceProviderController.getServices);
// Get service by ID
router.get("/services/:id", (0, authMiddleware_1.restrictTo)("SERVICE_PROVIDER"), serviceProviderController_1.ServiceProviderController.getServiceById);
// Update service
router.put("/services/:id", (0, authMiddleware_1.restrictTo)("SERVICE_PROVIDER"), fileUpload_1.uploadMultipleFiles, (0, validateRequest_1.validateRequest)({ body: serviceProviderValidators_1.serviceSchema }), serviceProviderController_1.ServiceProviderController.updateService);
// Delete service
router.delete("/services/:id", (0, authMiddleware_1.restrictTo)("SERVICE_PROVIDER"), serviceProviderController_1.ServiceProviderController.deleteService);
// Get all orders
router.get("/orders", (0, authMiddleware_1.restrictTo)("SERVICE_PROVIDER"), serviceProviderController_1.ServiceProviderController.getOrders);
// Respond to order
router.post("/respond/:orderId", (0, authMiddleware_1.restrictTo)("SERVICE_PROVIDER"), (0, validateRequest_1.validateRequest)({ body: serviceProviderValidators_1.serviceResponseSchema }), serviceProviderController_1.ServiceProviderController.respondToOrder);
//# sourceMappingURL=serviceProviderRoutes.js.map
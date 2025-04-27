"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.flightRoutes = void 0;
const express_1 = __importDefault(require("express"));
const flightController_1 = require("../controllers/flightController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validateRequest_1 = require("../middleware/validateRequest");
const flightValidators_1 = require("../validators/flightValidators");
const commonValidators_1 = require("../validators/commonValidators");
const router = express_1.default.Router();
exports.flightRoutes = router;
// Public routes
router.get("/", flightController_1.FlightController.getAllFlights);
router.get("/search", flightController_1.FlightController.searchFlights);
router.get("/:id", (0, validateRequest_1.validateRequest)({ params: commonValidators_1.idParamSchema }), flightController_1.FlightController.getFlightById);
router.get("/:id/availability", (0, validateRequest_1.validateRequest)({ params: commonValidators_1.idParamSchema }), flightController_1.FlightController.getFlightAvailability);
// Protected routes for admins and service providers
router.use(authMiddleware_1.protect);
router.post("/", (0, authMiddleware_1.restrictTo)("ADMIN", "SERVICE_PROVIDER"), (0, validateRequest_1.validateRequest)({ body: flightValidators_1.createFlightSchema }), flightController_1.FlightController.createFlight);
router.patch("/:id", (0, authMiddleware_1.restrictTo)("ADMIN", "SERVICE_PROVIDER"), (0, validateRequest_1.validateRequest)({ params: commonValidators_1.idParamSchema, body: flightValidators_1.updateFlightSchema }), flightController_1.FlightController.updateFlight);
router.delete("/:id", (0, authMiddleware_1.restrictTo)("ADMIN", "SERVICE_PROVIDER"), (0, validateRequest_1.validateRequest)({ params: commonValidators_1.idParamSchema }), flightController_1.FlightController.deleteFlight);
//# sourceMappingURL=flightRoutes.js.map
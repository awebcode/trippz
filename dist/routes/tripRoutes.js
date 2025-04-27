"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tripRoutes = void 0;
const express_1 = __importDefault(require("express"));
const tripController_1 = require("../controllers/tripController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validateRequest_1 = require("../middleware/validateRequest");
const tripValidators_1 = require("../validators/tripValidators");
const commonValidators_1 = require("../validators/commonValidators");
const router = express_1.default.Router();
exports.tripRoutes = router;
// Public routes
router.get("/", tripController_1.TripController.getAllTrips);
router.get("/search", tripController_1.TripController.searchTrips);
router.get("/:id", (0, validateRequest_1.validateRequest)({ params: commonValidators_1.idParamSchema }), tripController_1.TripController.getTripById);
router.get("/:id/availability", (0, validateRequest_1.validateRequest)({ params: commonValidators_1.idParamSchema }), tripController_1.TripController.getTripAvailability);
// Protected routes
router.use(authMiddleware_1.protect);
router.post("/", (0, validateRequest_1.validateRequest)({ body: tripValidators_1.createTripSchema }), tripController_1.TripController.createTrip);
router.patch("/:id", (0, validateRequest_1.validateRequest)({ params: commonValidators_1.idParamSchema, body: tripValidators_1.updateTripSchema }), tripController_1.TripController.updateTrip);
router.delete("/:id", (0, validateRequest_1.validateRequest)({ params: commonValidators_1.idParamSchema }), tripController_1.TripController.deleteTrip);
//# sourceMappingURL=tripRoutes.js.map
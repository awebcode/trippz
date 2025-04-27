"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hotelRoutes = void 0;
const express_1 = __importDefault(require("express"));
const hotelController_1 = require("../controllers/hotelController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validateRequest_1 = require("../middleware/validateRequest");
const hotelValidators_1 = require("../validators/hotelValidators");
const commonValidators_1 = require("../validators/commonValidators");
const router = express_1.default.Router();
exports.hotelRoutes = router;
// Public routes
router.get("/", hotelController_1.HotelController.getAllHotels);
router.get("/search", hotelController_1.HotelController.searchHotels);
router.get("/:id", (0, validateRequest_1.validateRequest)({ params: commonValidators_1.idParamSchema }), hotelController_1.HotelController.getHotelById);
router.get("/:id/availability", (0, validateRequest_1.validateRequest)({ params: commonValidators_1.idParamSchema }), hotelController_1.HotelController.getHotelAvailability);
// Protected routes for admins and service providers
router.use(authMiddleware_1.protect);
router.post("/", (0, authMiddleware_1.restrictTo)("ADMIN", "SERVICE_PROVIDER"), (0, validateRequest_1.validateRequest)({ body: hotelValidators_1.createHotelSchema }), hotelController_1.HotelController.createHotel);
router.patch("/:id", (0, authMiddleware_1.restrictTo)("ADMIN", "SERVICE_PROVIDER"), (0, validateRequest_1.validateRequest)({ params: commonValidators_1.idParamSchema, body: hotelValidators_1.updateHotelSchema }), hotelController_1.HotelController.updateHotel);
router.delete("/:id", (0, authMiddleware_1.restrictTo)("ADMIN", "SERVICE_PROVIDER"), (0, validateRequest_1.validateRequest)({ params: commonValidators_1.idParamSchema }), hotelController_1.HotelController.deleteHotel);
//# sourceMappingURL=hotelRoutes.js.map
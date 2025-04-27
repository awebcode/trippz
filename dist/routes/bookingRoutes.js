"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingRoutes = void 0;
const express_1 = __importDefault(require("express"));
const bookingController_1 = require("../controllers/bookingController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validateRequest_1 = require("../middleware/validateRequest");
const bookingValidators_1 = require("../validators/bookingValidators");
const commonValidators_1 = require("../validators/commonValidators");
const router = express_1.default.Router();
exports.bookingRoutes = router;
// All booking routes require authentication
router.use(authMiddleware_1.protect);
router.post("/", (0, validateRequest_1.validateRequest)({ body: bookingValidators_1.createBookingSchema }), bookingController_1.BookingController.createBooking);
router.get("/", (0, validateRequest_1.validateRequest)({ query: bookingValidators_1.bookingListQuerySchema }), bookingController_1.BookingController.getBookings);
router.get("/:id", (0, validateRequest_1.validateRequest)({ params: commonValidators_1.idParamSchema }), bookingController_1.BookingController.getBookingById);
router.patch("/:id", (0, validateRequest_1.validateRequest)({
    params: commonValidators_1.idParamSchema,
    body: bookingValidators_1.updateBookingSchema,
}), bookingController_1.BookingController.updateBooking);
router.post("/:id/cancel", (0, validateRequest_1.validateRequest)({ params: commonValidators_1.idParamSchema }), bookingController_1.BookingController.cancelBooking);
//# sourceMappingURL=bookingRoutes.js.map
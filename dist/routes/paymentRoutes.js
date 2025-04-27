"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRoutes = void 0;
const express_1 = __importDefault(require("express"));
const paymentController_1 = require("../controllers/paymentController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validateRequest_1 = require("../middleware/validateRequest");
const paymentValidators_1 = require("../validators/paymentValidators");
const router = express_1.default.Router();
exports.paymentRoutes = router;
// All routes are protected
router.use(authMiddleware_1.protect);
router.post("/", (0, validateRequest_1.validateRequest)({ body: paymentValidators_1.createPaymentSchema }), paymentController_1.PaymentController.processPayment);
router.get("/", paymentController_1.PaymentController.getPayments);
router.get("/:id", paymentController_1.PaymentController.getPaymentById);
router.post("/:id/refund", paymentController_1.PaymentController.refundPayment);
//# sourceMappingURL=paymentRoutes.js.map
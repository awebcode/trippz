"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const paymentService_1 = require("../services/paymentService");
const catchAsync_1 = require("../utils/catchAsync");
class PaymentController {
}
exports.PaymentController = PaymentController;
_a = PaymentController;
PaymentController.processPayment = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const data = req.body;
    const result = await paymentService_1.PaymentService.processPayment(userId, data);
    res.status(200).json({
        status: "success",
        data: result,
    });
});
PaymentController.getPayments = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const payments = await paymentService_1.PaymentService.getPaymentsByUser(userId);
    res.status(200).json({
        status: "success",
        data: payments,
    });
});
PaymentController.getPaymentById = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const paymentId = req.params.id;
    const payment = await paymentService_1.PaymentService.getPaymentById(userId, paymentId);
    res.status(200).json({
        status: "success",
        data: payment,
    });
});
PaymentController.refundPayment = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const userId = req.currentUser.id;
    const paymentId = req.params.id;
    const result = await paymentService_1.PaymentService.refundPayment(userId, paymentId);
    res.status(200).json({
        status: "success",
        data: result,
    });
});
//# sourceMappingURL=paymentController.js.map
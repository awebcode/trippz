"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentListQuerySchema = exports.createPaymentSchema = void 0;
const zod_1 = require("zod");
const commonValidators_1 = require("./commonValidators");
exports.createPaymentSchema = zod_1.z
    .object({
    booking_id: zod_1.z.string({ required_error: "Booking ID is required" }).uuid({ message: "Invalid booking ID format" }),
    payment_method: zod_1.z.enum(["CREDIT_CARD", "PAYPAL", "GOOGLE_PAY", "APPLE_PAY"], {
        required_error: "Payment method is required",
        invalid_type_error: "Payment method must be one of: CREDIT_CARD, PAYPAL, GOOGLE_PAY, APPLE_PAY",
    }),
    card_number: zod_1.z.string().optional(),
    card_expiry: zod_1.z.string().optional(),
    card_cvv: zod_1.z.string().optional(),
    billing_address: zod_1.z.string().optional(),
})
    .strict()
    .refine((data) => {
    if (data.payment_method === "CREDIT_CARD") {
        return !!data.card_number && !!data.card_expiry && !!data.card_cvv;
    }
    return true;
}, {
    message: "Card details are required for credit card payments",
    path: ["payment_method"],
});
exports.paymentListQuerySchema = commonValidators_1.paginationQuerySchema.extend({
    status: zod_1.z.enum(["SUCCESS", "PENDING", "FAILED", "REFUNDED"]).optional(),
    payment_method: zod_1.z.enum(["CREDIT_CARD", "PAYPAL", "GOOGLE_PAY", "APPLE_PAY"]).optional(),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
});
//# sourceMappingURL=paymentValidators.js.map
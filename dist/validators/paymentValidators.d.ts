import { z } from "zod";
export declare const createPaymentSchema: z.ZodEffects<z.ZodObject<{
    booking_id: z.ZodString;
    payment_method: z.ZodEnum<["CREDIT_CARD", "PAYPAL", "GOOGLE_PAY", "APPLE_PAY"]>;
    card_number: z.ZodOptional<z.ZodString>;
    card_expiry: z.ZodOptional<z.ZodString>;
    card_cvv: z.ZodOptional<z.ZodString>;
    billing_address: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    booking_id: string;
    payment_method: "CREDIT_CARD" | "PAYPAL" | "GOOGLE_PAY" | "APPLE_PAY";
    card_number?: string | undefined;
    card_expiry?: string | undefined;
    card_cvv?: string | undefined;
    billing_address?: string | undefined;
}, {
    booking_id: string;
    payment_method: "CREDIT_CARD" | "PAYPAL" | "GOOGLE_PAY" | "APPLE_PAY";
    card_number?: string | undefined;
    card_expiry?: string | undefined;
    card_cvv?: string | undefined;
    billing_address?: string | undefined;
}>, {
    booking_id: string;
    payment_method: "CREDIT_CARD" | "PAYPAL" | "GOOGLE_PAY" | "APPLE_PAY";
    card_number?: string | undefined;
    card_expiry?: string | undefined;
    card_cvv?: string | undefined;
    billing_address?: string | undefined;
}, {
    booking_id: string;
    payment_method: "CREDIT_CARD" | "PAYPAL" | "GOOGLE_PAY" | "APPLE_PAY";
    card_number?: string | undefined;
    card_expiry?: string | undefined;
    card_cvv?: string | undefined;
    billing_address?: string | undefined;
}>;
export declare const paymentListQuerySchema: z.ZodObject<z.objectUtil.extendShape<{
    page: z.ZodPipeline<z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>, z.ZodDefault<z.ZodNumber>>;
    limit: z.ZodPipeline<z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>, z.ZodDefault<z.ZodNumber>>;
    sortBy: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
}, {
    status: z.ZodOptional<z.ZodEnum<["SUCCESS", "PENDING", "FAILED", "REFUNDED"]>>;
    payment_method: z.ZodOptional<z.ZodEnum<["CREDIT_CARD", "PAYPAL", "GOOGLE_PAY", "APPLE_PAY"]>>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}>, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
    status?: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED" | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    payment_method?: "CREDIT_CARD" | "PAYPAL" | "GOOGLE_PAY" | "APPLE_PAY" | undefined;
}, {
    limit?: string | undefined;
    status?: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED" | undefined;
    page?: string | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    payment_method?: "CREDIT_CARD" | "PAYPAL" | "GOOGLE_PAY" | "APPLE_PAY" | undefined;
}>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type PaymentListQuery = z.infer<typeof paymentListQuerySchema>;
//# sourceMappingURL=paymentValidators.d.ts.map
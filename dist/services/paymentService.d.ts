import type { CreatePaymentInput } from "../validators/paymentValidators";
export declare class PaymentService {
    static processPayment(userId: string, data: CreatePaymentInput): Promise<{
        payment: {
            payment_details: {
                id: string;
                created_at: Date;
                updated_at: Date;
                provider: string;
                transaction_id: string;
                payment_data: string;
                refund_id: string | null;
                refund_data: string | null;
                paymentId: string;
            } | null;
        } & {
            id: string;
            created_at: Date;
            updated_at: Date;
            booking_id: string;
            payment_method: import("@prisma/client").$Enums.PaymentMethod;
            amount_paid: number;
            payment_status: import("@prisma/client").$Enums.PaymentStatus;
            payment_date: Date;
        };
        message: string;
    }>;
    private static processStripePayment;
    private static processPayPalPayment;
    private static processGooglePayPayment;
    private static processApplePayPayment;
    static getPaymentsByUser(userId: string): Promise<({
        booking: {
            id: string;
            created_at: Date;
            updated_at: Date;
            status: import("@prisma/client").$Enums.BookingStatus;
            user_id: string;
            guests: number | null;
            hotel_id: string | null;
            end_date: Date;
            start_date: Date;
            flight_id: string | null;
            trip_id: string | null;
            booking_type: import("@prisma/client").$Enums.BookingType;
            total_price: number;
            special_requests: string | null;
            cancellation_id: string | null;
        };
        payment_details: {
            id: string;
            created_at: Date;
            updated_at: Date;
            provider: string;
            transaction_id: string;
            payment_data: string;
            refund_id: string | null;
            refund_data: string | null;
            paymentId: string;
        } | null;
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        booking_id: string;
        payment_method: import("@prisma/client").$Enums.PaymentMethod;
        amount_paid: number;
        payment_status: import("@prisma/client").$Enums.PaymentStatus;
        payment_date: Date;
    })[]>;
    static getPaymentById(userId: string, paymentId: string): Promise<{
        booking: {
            id: string;
            created_at: Date;
            updated_at: Date;
            status: import("@prisma/client").$Enums.BookingStatus;
            user_id: string;
            guests: number | null;
            hotel_id: string | null;
            end_date: Date;
            start_date: Date;
            flight_id: string | null;
            trip_id: string | null;
            booking_type: import("@prisma/client").$Enums.BookingType;
            total_price: number;
            special_requests: string | null;
            cancellation_id: string | null;
        };
        payment_details: {
            id: string;
            created_at: Date;
            updated_at: Date;
            provider: string;
            transaction_id: string;
            payment_data: string;
            refund_id: string | null;
            refund_data: string | null;
            paymentId: string;
        } | null;
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        booking_id: string;
        payment_method: import("@prisma/client").$Enums.PaymentMethod;
        amount_paid: number;
        payment_status: import("@prisma/client").$Enums.PaymentStatus;
        payment_date: Date;
    }>;
    static refundPayment(userId: string, paymentId: string): Promise<{
        message: string;
        refund: {
            refundId: string;
            refundData: string;
        };
    }>;
    private static processStripeRefund;
    private static processPayPalRefund;
    private static processGooglePayRefund;
    private static processApplePayRefund;
}
//# sourceMappingURL=paymentService.d.ts.map
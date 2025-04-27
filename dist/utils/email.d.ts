export declare class EmailService {
    static sendWelcomeEmail(email: string, firstName: string): Promise<import("resend").CreateEmailResponseSuccess | null>;
    static sendVerificationEmail(email: string, token: string): Promise<import("resend").CreateEmailResponseSuccess | null>;
    static sendPasswordResetEmail(email: string, token: string): Promise<import("resend").CreateEmailResponseSuccess | null>;
    static sendBookingConfirmation(email: string, bookingDetails: any): Promise<import("resend").CreateEmailResponseSuccess | null>;
    static sendBookingCancellation(email: string, cancellationDetails: any): Promise<import("resend").CreateEmailResponseSuccess | null>;
    static sendRefundConfirmation(email: string, refundDetails: any): Promise<import("resend").CreateEmailResponseSuccess | null>;
    static sendBookingStatusUpdate(email: string, bookingDetails: any): Promise<import("resend").CreateEmailResponseSuccess | null>;
    static sendNotification(email: string, notificationDetails: {
        notification_type: string;
        message: string;
        title?: string;
    }): Promise<import("resend").CreateEmailResponseSuccess | null>;
}
//# sourceMappingURL=email.d.ts.map
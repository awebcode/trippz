export declare class SmsService {
    static sendVerificationSms(phoneNumber: string, code: string): Promise<import("twilio/lib/rest/api/v2010/account/message").MessageInstance>;
    static sendBookingConfirmationSms(phoneNumber: string, bookingId: string): Promise<import("twilio/lib/rest/api/v2010/account/message").MessageInstance>;
    static sendBookingCancellationSms(phoneNumber: string, bookingId: string): Promise<import("twilio/lib/rest/api/v2010/account/message").MessageInstance>;
    static sendBookingStatusUpdateSms(phoneNumber: string, bookingId: string): Promise<import("twilio/lib/rest/api/v2010/account/message").MessageInstance>;
    static sendNotification(phoneNumber: string, msg: string): Promise<import("twilio/lib/rest/api/v2010/account/message").MessageInstance>;
}
//# sourceMappingURL=sms.d.ts.map
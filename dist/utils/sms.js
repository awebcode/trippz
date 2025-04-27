"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsService = void 0;
const twilio_1 = __importDefault(require("twilio"));
const logger_1 = require("./logger");
const config_1 = require("../config");
// Initialize Twilio
const client = (0, twilio_1.default)(config_1.config.twilio.accountSid, config_1.config.twilio.authToken);
const twilioFromPhoneNumber = config_1.config.twilio.phoneNumber;
class SmsService {
    static async sendVerificationSms(phoneNumber, code) {
        try {
            const message = await client.messages.create({
                body: `Your Trippz verification code is: ${code}`,
                from: twilioFromPhoneNumber,
                to: phoneNumber,
            });
            logger_1.logger.info(`SMS sent with SID: ${message.sid}`);
            return message;
        }
        catch (error) {
            logger_1.logger.error(`Error sending verification SMS: ${error}`);
            throw error;
        }
        // return `Your Trippz verification code is: ${code}`
    }
    static async sendBookingConfirmationSms(phoneNumber, bookingId) {
        try {
            const message = await client.messages.create({
                body: `Your Trippz booking (ID: ${bookingId}) has been confirmed! Thank you for choosing Trippz.`,
                from: twilioFromPhoneNumber,
                to: phoneNumber,
            });
            logger_1.logger.info(`Booking confirmation SMS sent with SID: ${message.sid}`);
            return message;
        }
        catch (error) {
            logger_1.logger.error(`Error sending booking confirmation SMS: ${error}`);
            throw error;
        }
        // }
        // return `Your Trippz booking (ID: ${bookingId}) has been confirmed! Thank you for choosing Trippz.`
    }
    static async sendBookingCancellationSms(phoneNumber, bookingId) {
        try {
            const message = await client.messages.create({
                body: `Your Trippz booking (ID: ${bookingId}) has been cancelled. We hope to see you again soon!`,
                from: twilioFromPhoneNumber,
                to: phoneNumber,
            });
            logger_1.logger.info(`Booking cancellation SMS sent with SID: ${message.sid}`);
            return message;
        }
        catch (error) {
            logger_1.logger.error(`Error sending booking cancellation SMS: ${error}`);
            throw error;
        }
        // }
        // return `Your Trippz booking (ID: ${bookingId}) has been cancelled. We hope to see you again soon!`
    }
    ///sendBookingStatusUpdateSms
    static async sendBookingStatusUpdateSms(phoneNumber, bookingId) {
        try {
            const message = await client.messages.create({
                body: `Your Trippz booking (ID: ${bookingId}) has been updated. Check your dashboard for details.`,
                from: twilioFromPhoneNumber,
                to: phoneNumber,
            });
            logger_1.logger.info(`Booking status update SMS sent with SID: ${message.sid}`);
            return message;
        }
        catch (error) {
            logger_1.logger.error(`Error sending booking status update SMS: ${error}`);
            throw error;
        }
        // }
        // return `Your Trippz booking (ID: ${bookingId}) has been updated. Check your dashboard for details.`
    }
    //sendNotification
    static async sendNotification(phoneNumber, msg) {
        try {
            const message = await client.messages.create({
                body: msg,
                from: twilioFromPhoneNumber,
                to: phoneNumber,
            });
            logger_1.logger.info(`Notification SMS sent with SID: ${message.sid}`);
            return message;
        }
        catch (error) {
            logger_1.logger.error(`Error sending notification SMS: ${error}`);
            throw error;
        }
    }
}
exports.SmsService = SmsService;
//# sourceMappingURL=sms.js.map
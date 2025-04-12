import twilio from "twilio";
import { logger } from "./logger";

// Initialize Twilio

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export class SmsService {
  static async sendVerificationSms(phoneNumber: string, code: string) {
    try {
      const message = await client.messages.create({
        body: `Your Trippz verification code is: ${code}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });

      logger.info(`SMS sent with SID: ${message.sid}`);
      return message;
    } catch (error) {
      logger.error(`Error sending verification SMS: ${error}`);
      throw error;
    }
    // return `Your Trippz verification code is: ${code}`
  }

  static async sendBookingConfirmationSms(phoneNumber: string, bookingId: string) {
    try {
      const message = await client.messages.create({
        body: `Your Trippz booking (ID: ${bookingId}) has been confirmed! Thank you for choosing Trippz.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });

      logger.info(`Booking confirmation SMS sent with SID: ${message.sid}`);
      return message;
    } catch (error) {
      logger.error(`Error sending booking confirmation SMS: ${error}`);
      throw error;
    }
    // }
    // return `Your Trippz booking (ID: ${bookingId}) has been confirmed! Thank you for choosing Trippz.` 
  }
}

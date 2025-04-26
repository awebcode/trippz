import twilio from "twilio"
import { logger } from "./logger"
import { config } from "../config";

// Initialize Twilio

const client = twilio(config.twilio.accountSid, config.twilio.authToken);
const twilioFromPhoneNumber = config.twilio.phoneNumber

export class SmsService {
  static async sendVerificationSms(phoneNumber: string, code: string) {
    try {
      const message = await client.messages.create({
        body: `Your Trippz verification code is: ${code}`,
        from: twilioFromPhoneNumber,
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
        from: twilioFromPhoneNumber,
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

  static async sendBookingCancellationSms(phoneNumber: string, bookingId: string) {
    try {
      const message = await client.messages.create({
        body: `Your Trippz booking (ID: ${bookingId}) has been cancelled. We hope to see you again soon!`,
        from: twilioFromPhoneNumber,
        to: phoneNumber,
      });

      logger.info(`Booking cancellation SMS sent with SID: ${message.sid}`);
      return message;
    } catch (error) {
      logger.error(`Error sending booking cancellation SMS: ${error}`);
      throw error;
    }
    // }
    // return `Your Trippz booking (ID: ${bookingId}) has been cancelled. We hope to see you again soon!`
  }

  ///sendBookingStatusUpdateSms

  static async sendBookingStatusUpdateSms(phoneNumber: string, bookingId: string) {
    try {
      const message = await client.messages.create({
        body: `Your Trippz booking (ID: ${bookingId}) has been updated. Check your dashboard for details.`,
        from: twilioFromPhoneNumber,
        to: phoneNumber,
      });

      logger.info(`Booking status update SMS sent with SID: ${message.sid}`);
      return message;
    } catch (error) {
      logger.error(`Error sending booking status update SMS: ${error}`);
      throw error;
    }
    // }
    // return `Your Trippz booking (ID: ${bookingId}) has been updated. Check your dashboard for details.`
  }
  //sendNotification
  static async sendNotification(phoneNumber: string, msg: string) {
    try {
      const message = await client.messages.create({
        body: msg,
        from: twilioFromPhoneNumber,
        to: phoneNumber,
      });

      logger.info(`Notification SMS sent with SID: ${message.sid}`);
      return message;
    } catch (error) {
      logger.error(`Error sending notification SMS: ${error}`);
      throw error;
    }
  }
}


import { logger } from "./logger";
import { config } from "../config";
import axios from "axios";
// Initialize Brevo SMS API client

const senderName = config.brevo.senderName || "Trippz"

export class SmsService {
  static async sendVerificationSms(phoneNumber: string, code: string) {
    const content = `Your Trippz verification code is: ${code}`;
    return this.sendSms(phoneNumber, content, "Verification");
  }

  static async sendBookingConfirmationSms(phoneNumber: string, bookingId: string) {
    const content = `Your Trippz booking (ID: ${bookingId}) has been confirmed! Thank you for choosing Trippz.`;
    return this.sendSms(phoneNumber, content, "Booking Confirmation");
  }

  static async sendBookingCancellationSms(phoneNumber: string, bookingId: string) {
    const content = `Your Trippz booking (ID: ${bookingId}) has been cancelled. We hope to see you again soon!`;
    return this.sendSms(phoneNumber, content, "Booking Cancellation");
  }

  static async sendBookingStatusUpdateSms(phoneNumber: string, bookingId: string) {
    const content = `Your Trippz booking (ID: ${bookingId}) has been updated. Check your dashboard for details.`;
    return this.sendSms(phoneNumber, content, "Booking Status Update");
  }

  static async sendNotification(phoneNumber: string, msg: string) {
    return this.sendSms(phoneNumber, msg, "Notification");
  }

  private static async sendSms(phoneNumber: string, content: string, context: string) {
    try {
      const response = await axios.post(
        "https://api.brevo.com/v3/transactionalSMS/sms",
        {
          type: "transactional",
          sender: senderName, // ✅ Must be approved in Brevo
          recipient: phoneNumber, // 📱 Replace with real number
          content,
        },
        {
          headers: {
            accept: "application/json",
            "api-key": config.brevo.apiKey,
            "content-type": "application/json",
          },
        }
      );
      logger.info(
        `${context} SMS sent via Brevo with response: ${JSON.stringify(response)}`
      );
      return response;
    } catch (error: any) {
      // console.log({ error });
      logger.error(`❌ Error sending ${context} SMS: ${error.message}`);
      // throw new Error(`Failed to send ${context} SMS`);
    }
  }
}

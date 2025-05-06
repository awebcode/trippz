import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";
import { logger } from "./logger";
import fs from "fs";
import path from "path";
import Handlebars from "handlebars";
import { config } from "../config";
// Load email templates

const from = `ashikur@orangetoolz.com`

const loadTemplate = (templateName: string) => {
  try {
    const templatePath = path.join(__dirname, `../../public/emails/${templateName}.html`);
    return fs.readFileSync(templatePath, "utf-8");
  } catch (error) {
    logger.error(`Error loading email template ${templateName}: ${error}`);
    // Return a basic template as fallback
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Trippz Email</title>
      </head>
      <body>
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4F46E5; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Trippz</h1>
          </div>
          <div style="padding: 20px; background-color: #f9fafb; border-radius: 0 0 5px 5px;">
            {{{content}}}
          </div>
          <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
            © ${new Date().getFullYear()} Trippz. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;
  }
};

// Compile template with Handlebars
const compileTemplate = (templateName: string, data: any) => {
  const template = loadTemplate(templateName);
  const baseTemplate = loadTemplate("base");

  // Register a partial for the content
  Handlebars.registerPartial("content", template);

  // Compile the base template
  const compiledTemplate = Handlebars.compile(baseTemplate);

  // Return the rendered HTML
  return compiledTemplate(data);
};

// Reusable Nodemailer function with failover
const sendEmail = async (emailOptions: {
  from: string;
  to: string;
  subject: string;
  html: string;
}) => {
  // Validate emailOptions
  if (!emailOptions || typeof emailOptions !== "object") {
    logger.error("emailOptions is undefined or not an object");
    throw new Error("Invalid email options: emailOptions is undefined or not an object");
  }

  const { from, to, subject, html } = emailOptions;
  if (!from || !to || !subject || !html) {
    logger.error("Missing required email options", { from, to, subject, html });
    throw new Error(
      "Missing required email options: from, to, subject, and html are required"
    );
  }
  // Primary SMTP configuration (Brevo)
  const primaryConfig = {
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure, // Use TLS if true
    auth: {
      user: config.smtp.auth.user,
      pass: config.smtp.auth.pass,
    },
  };

  // Validate primary config
  if (!primaryConfig.host || !primaryConfig.auth.user || !primaryConfig.auth.pass) {
    throw new Error(
      "Primary SMTP configuration is incomplete. Check SMTP_HOST, SMTP_USER, and SMTP_PASS."
    );
  }

  // const primaryTransport = nodemailer.createTransport(primaryConfig);

  // Fallback SMTP configuration (e.g., Mailtrap or another Brevo account)
  const fallbackConfig =
    config.smtp.fallback.host &&
    config.smtp.fallback.auth.user &&
    config.smtp.fallback.auth.pass
      ? {
          host: config.smtp.fallback.host,
          port: config.smtp.fallback.port || 587,
          secure: config.smtp.fallback.secure, // Use TLS if true
          auth: {
            user: config.smtp.fallback.auth.user,
            pass: config.smtp.fallback.auth.pass,
          },
        }
      : null;

  try {
    // Try primary SMTP

    // Add Postmark-specific header
    const headers = {
      "X-PM-Message-Stream": "broadcast",
    };

    const primaryTransport = nodemailer.createTransport({
      ...primaryConfig,
      headers,
    });
    const result = await primaryTransport.sendMail(emailOptions);
    logger.info(`Email sent via primary SMTP to ${emailOptions.to}`);
    return result;
  } catch (primaryError: any) {
    console.log(primaryError);
    logger.error(`Primary SMTP failed: ${primaryError.message}`);

    if (fallbackConfig) {
      try {
        const fallbackTransport = nodemailer.createTransport(fallbackConfig);
        const result = await fallbackTransport.sendMail(emailOptions);
        logger.info(`Email sent via fallback SMTP to ${emailOptions.to}`);
        return result;
      } catch (fallbackError: any) {
        logger.error(`Fallback SMTP failed: ${fallbackError.message}`);
        throw new Error(`Failed to send email: ${fallbackError.message}`);
      }
    } else {
      throw new Error(
        `Primary SMTP failed and no fallback configured: ${primaryError.message}`
      );
    }
  }
};

export class EmailService {
  static async sendWelcomeEmail(email: string, firstName: string) {
    try {
      const html = compileTemplate("welcome", {
        firstName,
        dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
        appName: "Trippz",
        supportEmail: "support@trippz.com",
      });

      const result = await sendEmail({
        from,
        to: email,
        subject: "Welcome to Trippz!",
        html,
      });

      return result;
    } catch (error: any) {
      logger.error(`Error in sendWelcomeEmail: ${error.message}`);
      // throw error;
    }
  }

  static async sendVerificationEmail(email: string, token: string) {
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
      const html = compileTemplate("verification", {
        verificationUrl,
        appName: "Trippz",
        supportEmail: "support@trippz.com",
      });

      const result = await sendEmail({
        from,
        to: email,
        subject: "Verify Your Email Address",
        html,
      });
      console.log({ result });
      return result;
    } catch (error: any) {
      logger.error(`Error in sendVerificationEmail: ${error.message}`);
      // throw error;
    }
  }

  static async sendPasswordResetEmail(email: string, token: string) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
      const html = compileTemplate("reset-password", {
        resetUrl,
        appName: "Trippz",
        supportEmail: "support@trippz.com",
        expiryTime: "1 hour",
      });

      const result = await sendEmail({
        from,
        to: email,
        subject: "Reset Your Password",
        html,
      });

      return result;
    } catch (error: any) {
      logger.error(`Error in sendPasswordResetEmail: ${error.message}`);
      // throw error;
    }
  }

  static async sendBookingConfirmation(email: string, bookingDetails: any) {
    try {
      const html = compileTemplate("booking-confirmation", {
        bookingId: bookingDetails.id,
        bookingType: bookingDetails.booking_type,
        startDate: new Date(bookingDetails.start_date).toLocaleDateString(),
        endDate: new Date(bookingDetails.end_date).toLocaleDateString(),
        totalPrice: bookingDetails.total_price,
        dashboardUrl: `${process.env.FRONTEND_URL}/dashboard/bookings`,
        appName: "Trippz",
        supportEmail: "support@trippz.com",
      });

      const result = await sendEmail({
        from,
        to: email,
        subject: "Booking Confirmation",
        html,
      });

      return result;
    } catch (error: any) {
      logger.error(`Error in sendBookingConfirmation: ${error.message}`);
      // throw error;
    }
  }

  static async sendBookingCancellation(email: string, cancellationDetails: any) {
    try {
      const html = compileTemplate("cancellation-confirmation", {
        bookingId: cancellationDetails.id,
        cancellationDate: new Date().toLocaleDateString(),
        dashboardUrl: `${process.env.FRONTEND_URL}/dashboard/bookings`,
        appName: "Trippz",
        supportEmail: "support@trippz.com",
      });

      const result = await sendEmail({
        from,
        to: email,
        subject: "Cancellation Confirmation",
        html,
      });

      return result;
    } catch (error: any) {
      logger.error(`Error in sendBookingCancellation: ${error.message}`);
      // throw error;
    }
  }

  static async sendRefundConfirmation(email: string, refundDetails: any) {
    try {
      const html = compileTemplate("refund-confirmation", {
        bookingId: refundDetails.booking_id,
        refundAmount: refundDetails.amount_paid,
        refundDate: new Date().toLocaleDateString(),
        dashboardUrl: `${process.env.FRONTEND_URL}/dashboard/payments`,
        appName: "Trippz",
        supportEmail: "support@trippz.com",
      });

      const result = await sendEmail({
        from,
        to: email,
        subject: "Refund Confirmation",
        html,
      });

      return result;
    } catch (error: any) {
      logger.error(`Error in sendRefundConfirmation: ${error.message}`);
      // throw error;
    }
  }

  static async sendBookingStatusUpdate(email: string, bookingDetails: any) {
    try {
      const html = compileTemplate("booking-status-update", {
        bookingId: bookingDetails.id,
        bookingType: bookingDetails.booking_type,
        startDate: new Date(bookingDetails.start_date).toLocaleDateString(),
        endDate: new Date(bookingDetails.end_date).toLocaleDateString(),
        totalPrice: bookingDetails.total_price,
        dashboardUrl: `${process.env.FRONTEND_URL}/dashboard/bookings`,
        appName: "Trippz",
        supportEmail: "support@trippz.com",
      });

      const result = await sendEmail({
        from,
        to: email,
        subject: "Booking Status Update",
        html,
      });

      return result;
    } catch (error: any) {
      logger.error(`Error in sendBookingStatusUpdate: ${error.message}`);
      // throw error;
    }
  }

  static async sendNotification(
    email: string,
    notificationDetails: {
      notification_type: string;
      message: string;
      title?: string;
    }
  ) {
    try {
      const html = compileTemplate("notification", {
        notificationType: notificationDetails.notification_type,
        notificationMessage: notificationDetails.message,
        dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
        appName: "Trippz",
        supportEmail: "support@trippz.com",
      });

      const result = await sendEmail({
        from,
        to: email,
        subject: notificationDetails.title || "Notification",
        html,
      });

      return result;
    } catch (error: any) {
      logger.error(`Error in sendNotification: ${error.message}`);
      // throw error;
    }
  }
}

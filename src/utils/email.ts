import { Resend } from "resend"
import { logger } from "./logger"
import fs from "fs"
import path from "path"
import Handlebars from "handlebars"

const resend = new Resend(process.env.RESEND_API_KEY)
const from =
  process.env.RESEND_FROM_EMAIL || "Trippz <onboarding@resend.dev>";
// Load email templates
const loadTemplate = (templateName: string) => {
  try {
    const templatePath = path.join(__dirname, `../../public/emails/${templateName}.html`)
    return fs.readFileSync(templatePath, "utf-8")
  } catch (error) {
    logger.error(`Error loading email template ${templateName}: ${error}`)
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
            &copy; ${new Date().getFullYear()} Trippz. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `
  }
}

// Compile template with Handlebars
const compileTemplate = (templateName: string, data: any) => {
  const template = loadTemplate(templateName)
  const baseTemplate = loadTemplate("base")

  // Register a partial for the content
  Handlebars.registerPartial("content", template)

  // Compile the base template
  const compiledTemplate = Handlebars.compile(baseTemplate)

  // Return the rendered HTML
  return compiledTemplate(data)
}

export class EmailService {
  static async sendVerificationEmail(email: string, token: string) {
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`

      const html = compileTemplate("verification", {
        verificationUrl,
        appName: "Trippz",
        supportEmail: "support@trippz.com",
      })

      const { data, error } = await resend.emails.send({
        from,
        to: email,
        subject: "Verify Your Email Address",
        html,
      })

      if (error) {
        logger.error(`Error sending verification email: ${error.message}`)
        throw new Error(`Failed to send verification email: ${error.message}`)
      }

      return data
    } catch (error) {
      logger.error(`Error in sendVerificationEmail: ${error}`)
      throw error
    }
  }

  static async sendPasswordResetEmail(email: string, token: string) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`

      const html = compileTemplate("reset-password", {
        resetUrl,
        appName: "Trippz",
        supportEmail: "support@trippz.com",
        expiryTime: "1 hour",
      })

      const { data, error } = await resend.emails.send({
        from,
        to: email,
        subject: "Reset Your Password",
        html,
      })

      if (error) {
        logger.error(`Error sending password reset email: ${error.message}`)
        throw new Error(`Failed to send password reset email: ${error.message}`)
      }

      return data
    } catch (error) {
      logger.error(`Error in sendPasswordResetEmail: ${error}`)
      throw error
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
      })

      const { data, error } = await resend.emails.send({
        from,
        to: email,
        subject: "Booking Confirmation",
        html,
      })

      if (error) {
        logger.error(`Error sending booking confirmation email: ${error.message}`)
        throw new Error(`Failed to send booking confirmation email: ${error.message}`)
      }

      return data
    } catch (error) {
      logger.error(`Error in sendBookingConfirmation: ${error}`)
      throw error
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
      })

      const { data, error } = await resend.emails.send({
        from,
        to: email,
        subject: "Refund Confirmation",
        html,
      })

      if (error) {
        logger.error(`Error sending refund confirmation email: ${error.message}`)
        throw new Error(`Failed to send refund confirmation email: ${error.message}`)
      }

      return data
    } catch (error) {
      logger.error(`Error in sendRefundConfirmation: ${error}`)
      throw error
    }
  }

  static async sendWelcomeEmail(email: string, firstName: string) {
    try {
      const html = compileTemplate("welcome", {
        firstName,
        dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
        appName: "Trippz",
        supportEmail: "support@trippz.com",
      })

      const { data, error } = await resend.emails.send({
        from,
        to: email,
        subject: "Welcome to Trippz!",
        html,
      })

      if (error) {
        logger.error(`Error sending welcome email: ${error.message}`)
        throw new Error(`Failed to send welcome email: ${error.message}`)
      }

      return data
    } catch (error) {
      logger.error(`Error in sendWelcomeEmail: ${error}`)
      throw error
    }
  }
}

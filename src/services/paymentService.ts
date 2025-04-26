import { prisma } from "../lib/prisma"
import { AppError } from "../utils/appError"
import { logger } from "../utils/logger"
import type { CreatePaymentInput } from "../validators/paymentValidators"
import Stripe from "stripe"
import { EmailService } from "../utils/email"
import { SmsService } from "../utils/sms"

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-03-31.basil",
})

export class PaymentService {
  static async processPayment(userId: string, data: CreatePaymentInput) {
    try {
      // Check if booking exists and belongs to user
      const booking = await prisma.booking.findUnique({
        where: { id: data.booking_id },
        include: {
          user: true,
        },
      })

      if (!booking) {
        throw new AppError("Booking not found", 404)
      }

      if (booking.user_id !== userId) {
        throw new AppError("You are not authorized to make payment for this booking", 403)
      }

      if (booking.status !== "PENDING") {
        throw new AppError("Payment can only be processed for pending bookings", 400)
      }

      let paymentResult

      // Process payment based on payment method
      switch (data.payment_method) {
        case "CREDIT_CARD":
          paymentResult = await this.processStripePayment(booking, data)
          break
        case "PAYPAL":
          paymentResult = await this.processPayPalPayment(booking, data)
          break
        case "GOOGLE_PAY":
          paymentResult = await this.processGooglePayPayment(booking, data)
          break
        case "APPLE_PAY":
          paymentResult = await this.processApplePayPayment(booking, data)
          break
        default:
          throw new AppError("Unsupported payment method", 400)
      }

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          booking_id: data.booking_id,
          payment_method: data.payment_method,
          amount_paid: booking.total_price,
          payment_status: "SUCCESS",
          payment_details: {
            create: {
              transaction_id: paymentResult.transactionId,
              provider: paymentResult.provider,
              payment_data: paymentResult.paymentData,
            },
          },
        },
        include: {
          payment_details: true,
        },
      })

      // Update booking status
      await prisma.booking.update({
        where: { id: data.booking_id },
        data: { status: "CONFIRMED" },
      })

      // Record transaction
      await prisma.transaction.create({
        data: {
          user_id: userId,
          transaction_type: "PAYMENT",
          amount: booking.total_price,
          status: "SUCCESS",
        },
      })

      // Send confirmation notifications
      await EmailService.sendBookingConfirmation(booking.user.email, {
        ...booking,
        payment: payment,
      })
      if (booking.user.phone_number) {
        await SmsService.sendBookingConfirmationSms(booking.user.phone_number, booking.id)
      }
      return {
        payment,
        message: "Payment processed successfully",
      }
    } catch (error) {
      logger.error(`Error in processPayment: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to process payment", 500)
    }
  }

  private static async processStripePayment(booking: any, data: CreatePaymentInput) {
    try {
      // Validate card details
      if (!data.card_number || !data.card_expiry || !data.card_cvv) {
        throw new AppError("Card details are required for credit card payments", 400)
      }

      // Parse expiry date
      const [expiryMonth, expiryYear] = data.card_expiry.split("/")

      // Create payment method
      const paymentMethod = await stripe.paymentMethods.create({
        type: "card",
        card: {
          number: data.card_number,
          exp_month: Number.parseInt(expiryMonth),
          exp_year: Number.parseInt(expiryYear),
          cvc: data.card_cvv,
        },
      })

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(booking.total_price * 100), // Stripe requires amount in cents
        currency: "usd",
        payment_method: paymentMethod.id,
        confirm: true,
        description: `Payment for booking ${booking.id}`,
        metadata: {
          booking_id: booking.id,
          user_id: booking.user_id,
        },
      })

      return {
        transactionId: paymentIntent.id,
        provider: "STRIPE",
        paymentData: JSON.stringify({
          payment_intent_id: paymentIntent.id,
          payment_method_id: paymentMethod.id,
          amount: paymentIntent.amount,
          status: paymentIntent.status,
        }),
      }
    } catch (error) {
      logger.error(`Error processing Stripe payment: ${error}`)
      throw new AppError("Failed to process credit card payment", 500)
    }
  }

  private static async processPayPalPayment(booking: any, data: CreatePaymentInput) {
    try {
      // In a real implementation, you would integrate with PayPal API
      // This is a simplified version for demonstration purposes

      // Simulate PayPal payment
      const transactionId = `PAYPAL_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`

      return {
        transactionId,
        provider: "PAYPAL",
        paymentData: JSON.stringify({
          transaction_id: transactionId,
          amount: booking.total_price,
          status: "COMPLETED",
        }),
      }
    } catch (error) {
      logger.error(`Error processing PayPal payment: ${error}`)
      throw new AppError("Failed to process PayPal payment", 500)
    }
  }

  private static async processGooglePayPayment(booking: any, data: CreatePaymentInput) {
    try {
      // In a real implementation, you would integrate with Google Pay API
      // This is a simplified version for demonstration purposes

      // Simulate Google Pay payment
      const transactionId = `GPAY_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`

      return {
        transactionId,
        provider: "GOOGLE_PAY",
        paymentData: JSON.stringify({
          transaction_id: transactionId,
          amount: booking.total_price,
          status: "COMPLETED",
        }),
      }
    } catch (error) {
      logger.error(`Error processing Google Pay payment: ${error}`)
      throw new AppError("Failed to process Google Pay payment", 500)
    }
  }

  private static async processApplePayPayment(booking: any, data: CreatePaymentInput) {
    try {
      // In a real implementation, you would integrate with Apple Pay API
      // This is a simplified version for demonstration purposes

      // Simulate Apple Pay payment
      const transactionId = `APAY_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`

      return {
        transactionId,
        provider: "APPLE_PAY",
        paymentData: JSON.stringify({
          transaction_id: transactionId,
          amount: booking.total_price,
          status: "COMPLETED",
        }),
      }
    } catch (error) {
      logger.error(`Error processing Apple Pay payment: ${error}`)
      throw new AppError("Failed to process Apple Pay payment", 500)
    }
  }

  static async getPaymentsByUser(userId: string) {
    try {
      const payments = await prisma.payment.findMany({
        where: {
          booking: {
            user_id: userId,
          },
        },
        include: {
          booking: true,
          payment_details: true,
        },
      })

      return payments
    } catch (error) {
      logger.error(`Error in getPaymentsByUser: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to get payments", 500)
    }
  }

  static async getPaymentById(userId: string, paymentId: string) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          booking: true,
          payment_details: true,
        },
      })

      if (!payment) {
        throw new AppError("Payment not found", 404)
      }

      if (payment.booking.user_id !== userId) {
        throw new AppError("You are not authorized to view this payment", 403)
      }

      return payment
    } catch (error) {
      logger.error(`Error in getPaymentById: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to get payment", 500)
    }
  }

  static async refundPayment(userId: string, paymentId: string) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          booking: true,
          payment_details: true,
        },
      })

      if (!payment) {
        throw new AppError("Payment not found", 404)
      }

      if (payment.booking.user_id !== userId) {
        throw new AppError("You are not authorized to refund this payment", 403)
      }

      if (payment.payment_status !== "SUCCESS") {
        throw new AppError("Only successful payments can be refunded", 400)
      }

      let refundResult

      // Process refund based on payment method
      switch (payment.payment_method) {
        case "CREDIT_CARD":
          refundResult = await this.processStripeRefund(payment)
          break
        case "PAYPAL":
          refundResult = await this.processPayPalRefund(payment)
          break
        case "GOOGLE_PAY":
          refundResult = await this.processGooglePayRefund(payment)
          break
        case "APPLE_PAY":
          refundResult = await this.processApplePayRefund(payment)
          break
        default:
          throw new AppError("Unsupported payment method for refund", 400)
      }

      // Update payment status
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          payment_status: "REFUNDED",
          payment_details: {
            update: {
              refund_id: refundResult.refundId,
              refund_data: refundResult.refundData,
            },
          },
        },
      })

      // Update booking status
      await prisma.booking.update({
        where: { id: payment.booking_id },
        data: { status: "CANCELED" },
      })

      // Record transaction
      await prisma.transaction.create({
        data: {
          user_id: userId,
          transaction_type: "REFUND",
          amount: payment.amount_paid,
          status: "SUCCESS",
        },
      })

      const findUser = await prisma.user.findUnique({
        where: { id: userId },
      })

      // Send refund notification
      if (findUser) {
        await EmailService.sendRefundConfirmation(findUser?.email, {
          ...payment,
          refund: refundResult,
        })
      }

      return {
        message: "Payment refunded successfully",
        refund: refundResult,
      }
    } catch (error) {
      logger.error(`Error in refundPayment: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to refund payment", 500)
    }
  }

  private static async processStripeRefund(payment: any) {
    try {
      // Parse payment details
      const paymentData = JSON.parse(payment.payment_details.payment_data)

      // Process refund through Stripe
      const refund = await stripe.refunds.create({
        payment_intent: paymentData.payment_intent_id,
      })

      return {
        refundId: refund.id,
        refundData: JSON.stringify({
          refund_id: refund.id,
          amount: refund.amount,
          status: refund.status,
        }),
      }
    } catch (error) {
      logger.error(`Error processing Stripe refund: ${error}`)
      throw new AppError("Failed to process credit card refund", 500)
    }
  }

  private static async processPayPalRefund(payment: any) {
    try {
      // In a real implementation, you would integrate with PayPal API
      // This is a simplified version for demonstration purposes

      // Simulate PayPal refund
      const refundId = `PAYPAL_REFUND_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`

      return {
        refundId,
        refundData: JSON.stringify({
          refund_id: refundId,
          amount: payment.amount_paid,
          status: "COMPLETED",
        }),
      }
    } catch (error) {
      logger.error(`Error processing PayPal refund: ${error}`)
      throw new AppError("Failed to process PayPal refund", 500)
    }
  }

  private static async processGooglePayRefund(payment: any) {
    try {
      // In a real implementation, you would integrate with Google Pay API
      // This is a simplified version for demonstration purposes

      // Simulate Google Pay refund
      const refundId = `GPAY_REFUND_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`

      return {
        refundId,
        refundData: JSON.stringify({
          refund_id: refundId,
          amount: payment.amount_paid,
          status: "COMPLETED",
        }),
      }
    } catch (error) {
      logger.error(`Error processing Google Pay refund: ${error}`)
      throw new AppError("Failed to process Google Pay refund", 500)
    }
  }

  private static async processApplePayRefund(payment: any) {
    try {
      // In a real implementation, you would integrate with Apple Pay API
      // This is a simplified version for demonstration purposes

      // Simulate Apple Pay refund
      const refundId = `APAY_REFUND_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`

      return {
        refundId,
        refundData: JSON.stringify({
          refund_id: refundId,
          amount: payment.amount_paid,
          status: "COMPLETED",
        }),
      }
    } catch (error) {
      logger.error(`Error processing Apple Pay refund: ${error}`)
      throw new AppError("Failed to process Apple Pay refund", 500)
    }
  }
}

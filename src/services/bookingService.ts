import { prisma } from "../lib/prisma"
import { AppError } from "../utils/appError"
import { logger } from "../utils/logger"
import type { CreateBookingInput, UpdateBookingInput } from "../validators/bookingValidators"
import { EmailService } from "../utils/email"
import { SmsService } from "../utils/sms"

export class BookingService {
  static async createBooking(userId: string, data: CreateBookingInput) {
    try {
      let totalPrice = 0

      // Calculate total price based on booking type
      if (data.booking_type === "FLIGHT" && data.flight_id) {
        const flight = await prisma.flight.findUnique({
          where: { id: data.flight_id },
        })

        if (!flight) {
          throw new AppError("Flight not found", 404)
        }

        totalPrice = flight.price
      } else if (data.booking_type === "HOTEL" && data.hotel_id) {
        const hotel = await prisma.hotel.findUnique({
          where: { id: data.hotel_id },
        })

        if (!hotel) {
          throw new AppError("Hotel not found", 404)
        }

        const startDate = new Date(data.start_date)
        const endDate = new Date(data.end_date)
        const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

        totalPrice = hotel.price_per_night * nights
      } else if (data.booking_type === "TRIP" && data.trip_id) {
        const trip = await prisma.trip.findUnique({
          where: { id: data.trip_id },
        })

        if (!trip) {
          throw new AppError("Trip not found", 404)
        }

        totalPrice = trip.price
      }

      // Create booking
      const booking = await prisma.booking.create({
        data: {
          user_id: userId,
          booking_type: data.booking_type,
          start_date: new Date(data.start_date),
          end_date: new Date(data.end_date),
          status: "PENDING",
          total_price: totalPrice,
          flight_id: data.flight_id,
          hotel_id: data.hotel_id,
          trip_id: data.trip_id,
        },
        include: {
          user: true,
          flight: true,
          hotel: true,
          trip: true,
        },
      })

      // Send confirmation email and SMS
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (user) {
        await EmailService.sendBookingConfirmation(user.email, booking)
        if (user.phone_number) {
          await SmsService.sendBookingConfirmationSms(user.phone_number, booking.id)
        }
      }

      return booking
    } catch (error) {
      logger.error(`Error in createBooking: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to create booking", 500)
    }
  }

  static async getBookings(userId: string) {
    try {
      const bookings = await prisma.booking.findMany({
        where: { user_id: userId },
        include: {
          flight: true,
          hotel: true,
          trip: true,
          Payment: true,
        },
      })

      return bookings
    } catch (error) {
      logger.error(`Error in getBookings: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to get bookings", 500)
    }
  }

  static async getBookingById(userId: string, id: string) {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          flight: true,
          hotel: true,
          trip: true,
          Payment: true,
          cancellation: true,
        },
      })

      if (!booking) {
        throw new AppError("Booking not found", 404)
      }

      if (booking.user_id !== userId) {
        throw new AppError("You are not authorized to view this booking", 403)
      }

      return booking
    } catch (error) {
      logger.error(`Error in getBookingById: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to get booking", 500)
    }
  }

  static async updateBooking(userId: string, id: string, data: UpdateBookingInput) {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id },
      })

      if (!booking) {
        throw new AppError("Booking not found", 404)
      }

      if (booking.user_id !== userId) {
        throw new AppError("You are not authorized to update this booking", 403)
      }

      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: {
          start_date: data.start_date ? new Date(data.start_date) : booking.start_date,
          end_date: data.end_date ? new Date(data.end_date) : booking.end_date,
          status: data.status ?? booking.status,
        },
      })

      return updatedBooking
    } catch (error) {
      logger.error(`Error in updateBooking: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to update booking", 500)
    }
  }

  static async cancelBooking(userId: string, id: string) {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id },
      })

      if (!booking) {
        throw new AppError("Booking not found", 404)
      }

      if (booking.user_id !== userId) {
        throw new AppError("You are not authorized to cancel this booking", 403)
      }

      // Check if booking can be canceled
      if (booking.status === "CANCELED") {
        throw new AppError("Booking is already canceled", 400)
      }

      if (booking.status === "COMPLETED") {
        throw new AppError("Completed bookings cannot be canceled", 400)
      }

      // Apply cancellation policy
      // For simplicity, we're using a default cancellation policy
      const cancellationPolicy = await prisma.cancelationPolicy.findFirst({
        where: { policy_type: "PARTIAL_REFUND" },
      })

      let cancellationId = null
      if (cancellationPolicy) {
        cancellationId = cancellationPolicy.id
      }

      // Update booking status
      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: {
          status: "CANCELED",
          cancellation_id: cancellationId,
        },
        include: {
          cancellation: true,
        },
      })

      return updatedBooking
    } catch (error) {
      logger.error(`Error in cancelBooking: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to cancel booking", 500)
    }
  }
}

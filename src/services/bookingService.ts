import { prisma } from "../lib/prisma"
import { AppError } from "../utils/appError"
import { logger } from "../utils/logger"
import type { CreateBookingInput, UpdateBookingInput, BookingListQuery } from "../validators/bookingValidators"
import type { PaginatedResult } from "../validators/commonValidators"
import { EmailService } from "../utils/email"
import { SmsService } from "../utils/sms"

export class BookingService {
  static async createBooking(userId: string, data: CreateBookingInput) {
    try {
      // Validate availability based on booking type
      if (data.booking_type === "HOTEL" && data.hotel_id) {
        await this.validateHotelAvailability(data.hotel_id, data.start_date, data.end_date)
      } else if (data.booking_type === "FLIGHT" && data.flight_id) {
        await this.validateFlightAvailability(data.flight_id)
      } else if (data.booking_type === "TRIP" && data.trip_id) {
        await this.validateTripAvailability(data.trip_id, data.start_date, data.end_date)
      }

      // Calculate total price based on booking type
      let totalPrice = 0
      if (data.booking_type === "HOTEL" && data.hotel_id) {
        totalPrice = await this.calculateHotelPrice(data.hotel_id, data.start_date, data.end_date, data.guests || 1)
      } else if (data.booking_type === "FLIGHT" && data.flight_id) {
        totalPrice = await this.calculateFlightPrice(data.flight_id, data.guests || 1)
      } else if (data.booking_type === "TRIP" && data.trip_id) {
        totalPrice = await this.calculateTripPrice(data.trip_id, data.guests || 1)
      }

      // Create booking
      const booking = await prisma.booking.create({
        data: {
          user_id: userId,
          booking_type: data.booking_type,
          start_date: new Date(data.start_date),
          end_date: new Date(data.end_date),
          flight_id: data.flight_id,
          hotel_id: data.hotel_id,
          trip_id: data.trip_id,
          status: "PENDING",
          total_price: totalPrice,
          guests: data.guests || 1,
          special_requests: data.special_requests,
        },
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              phone_number: true,
            },
          },
          flight: data.booking_type === "FLIGHT" ? true : false,
          hotel: data.booking_type === "HOTEL" ? true : false,
          trip: data.booking_type === "TRIP" ? true : false,
        },
      })

      // Send booking confirmation
      await EmailService.sendBookingConfirmation(booking.user.email, booking)
      if (booking.user.phone_number) {
        await SmsService.sendBookingConfirmationSms(booking.user.phone_number, booking.id)
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

  static async getBookings(userId: string, params: BookingListQuery): Promise<PaginatedResult<any>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "created_at",
        sortOrder = "desc",
        status,
        booking_type,
        startDate,
        endDate,
      } = params

      // Calculate pagination values
      const skip = (page - 1) * limit

      // Build where conditions
      const where: any = {
        user_id: userId,
      }

      if (status) {
        where.status = status
      }

      if (booking_type) {
        where.booking_type = booking_type
      }

      if (startDate) {
        where.start_date = {
          gte: new Date(startDate),
        }
      }

      if (endDate) {
        where.end_date = {
          lte: new Date(endDate),
        }
      }

      // Get total count (without filters except user_id)
      const totalCount = await prisma.booking.count({
        where: { user_id: userId },
      })

      // Get filtered count
      const filteredCount = await prisma.booking.count({ where })

      // Get paginated data
      const bookings = await prisma.booking.findMany({
        where,
        include: {
          flight: true,
          hotel: true,
          trip: true,
          Payment: {
            select: {
              id: true,
              payment_method: true,
              amount_paid: true,
              payment_status: true,
              created_at: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      })

      // Process bookings to include entity details
      const processedBookings = bookings.map((booking) => {
        let entityDetails = null

        if (booking.booking_type === "FLIGHT" && booking.flight) {
          entityDetails = {
            id: booking.flight.id,
            name: `${booking.flight.airline} ${booking.flight.flight_number}`,
            from: booking.flight.from_airport,
            to: booking.flight.to_airport,
            departure: booking.flight.departure_time,
            arrival: booking.flight.arrival_time,
          }
        } else if (booking.booking_type === "HOTEL" && booking.hotel) {
          entityDetails = {
            id: booking.hotel.id,
            name: booking.hotel.name,
            address: booking.hotel.address,
            rating: booking.hotel.rating,
          }
        } else if (booking.booking_type === "TRIP" && booking.trip) {
          entityDetails = {
            id: booking.trip.id,
            name: booking.trip.trip_name,
            type: booking.trip.trip_type,
            description: booking.trip.description,
          }
        }

        return {
          id: booking.id,
          booking_type: booking.booking_type,
          status: booking.status,
          start_date: booking.start_date,
          end_date: booking.end_date,
          total_price: booking.total_price,
          guests: booking.guests,
          special_requests: booking.special_requests,
          created_at: booking.created_at,
          updated_at: booking.updated_at,
          entity_details: entityDetails,
          payment: booking.Payment,
          // Remove raw entity data
          flight: undefined,
          hotel: undefined,
          trip: undefined,
        }
      })

      // Calculate total pages
      const totalPages = Math.ceil(filteredCount / limit)

      return {
        data: processedBookings,
        metadata: {
          totalCount,
          filteredCount,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      }
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
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              phone_number: true,
            },
          },
          flight: true,
          hotel: true,
          trip: true,
          Payment: {
            include: {
              payment_details: true,
            },
          },
        },
      })

      if (!booking) {
        throw new AppError("Booking not found", 404)
      }

      if (booking.user_id !== userId) {
        throw new AppError("You are not authorized to view this booking", 403)
      }

      // Process booking to include entity details
      let entityDetails = null

      if (booking.booking_type === "FLIGHT" && booking.flight) {
        entityDetails = {
          id: booking.flight.id,
          name: `${booking.flight.airline} ${booking.flight.flight_number}`,
          from: booking.flight.from_airport,
          to: booking.flight.to_airport,
          departure: booking.flight.departure_time,
          arrival: booking.flight.arrival_time,
          seat_class: booking.flight.seat_class,
          price: booking.flight.price,
        }
      } else if (booking.booking_type === "HOTEL" && booking.hotel) {
        entityDetails = {
          id: booking.hotel.id,
          name: booking.hotel.name,
          address: booking.hotel.address,
          rating: booking.hotel.rating,
          price_per_night: booking.hotel.price_per_night,
          amenities: booking.hotel.amenities,
        }
      } else if (booking.booking_type === "TRIP" && booking.trip) {
        entityDetails = {
          id: booking.trip.id,
          name: booking.trip.trip_name,
          type: booking.trip.trip_type,
          description: booking.trip.description,
          price: booking.trip.price,
        }
      }

      return {
        id: booking.id,
        booking_type: booking.booking_type,
        status: booking.status,
        start_date: booking.start_date,
        end_date: booking.end_date,
        total_price: booking.total_price,
        guests: booking.guests,
        special_requests: booking.special_requests,
        created_at: booking.created_at,
        updated_at: booking.updated_at,
        user: booking.user,
        entity_details: entityDetails,
        payment: booking.Payment,
        // Remove raw entity data
        flight: undefined,
        hotel: undefined,
        trip: undefined,
      }
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

      // Check if booking can be updated
      if (booking.status === "COMPLETED" || booking.status === "CANCELED") {
        throw new AppError(`Cannot update a ${booking.status.toLowerCase()} booking`, 400)
      }

      // If changing dates, validate availability
      if ((data.start_date || data.end_date) && booking.booking_type === "HOTEL" && booking.hotel_id) {
        await this.validateHotelAvailability(
          booking.hotel_id,
          data.start_date || booking.start_date.toISOString(),
          data.end_date || booking.end_date.toISOString(),
        )
      } else if ((data.start_date || data.end_date) && booking.booking_type === "TRIP" && booking.trip_id) {
        await this.validateTripAvailability(
          booking.trip_id,
          data.start_date || booking.start_date.toISOString(),
          data.end_date || booking.end_date.toISOString(),
        )
      }

      // Recalculate price if necessary
      let totalPrice = booking.total_price
      if ((data.start_date || data.end_date || data.guests) && booking.booking_type === "HOTEL" && booking.hotel_id) {
        totalPrice = await this.calculateHotelPrice(
          booking.hotel_id,
          data.start_date || booking.start_date.toISOString(),
          data.end_date || booking.end_date.toISOString(),
          data.guests || booking.guests || 0,
        )
      } else if (data.guests && booking.booking_type === "FLIGHT" && booking.flight_id) {
        totalPrice = await this.calculateFlightPrice(booking.flight_id, data.guests || booking.guests || 0)
      } else if (data.guests && booking.booking_type === "TRIP" && booking.trip_id) {
        totalPrice = await this.calculateTripPrice(booking.trip_id, data.guests || booking.guests || 0)
      }

      // Update booking
      const updatedBooking = await prisma.booking.update({
        where: { id },
        data: {
          start_date: data.start_date ? new Date(data.start_date) : undefined,
          end_date: data.end_date ? new Date(data.end_date) : undefined,
          status: data.status,
          total_price: totalPrice,
          guests: data.guests,
          special_requests: data.special_requests,
        },
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              phone_number: true,
            },
          },
          flight: booking.booking_type === "FLIGHT" ? true : false,
          hotel: booking.booking_type === "HOTEL" ? true : false,
          trip: booking.booking_type === "TRIP" ? true : false,
        },
      })

      // Send booking update notification
      if (data.status) {
        await EmailService.sendBookingStatusUpdate(updatedBooking.user.email, updatedBooking)
        if (updatedBooking.user.phone_number) {
          await SmsService.sendBookingStatusUpdateSms(updatedBooking.user.phone_number, updatedBooking.id)
        }
      }

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
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phone_number: true,
            },
          },
          Payment: true,
        },
      })

      if (!booking) {
        throw new AppError("Booking not found", 404)
      }

      if (booking.user_id !== userId) {
        throw new AppError("You are not authorized to cancel this booking", 403)
      }

      // Check if booking can be canceled
      if (booking.status === "COMPLETED" || booking.status === "CANCELED") {
        throw new AppError(`Cannot cancel a ${booking.status.toLowerCase()} booking`, 400)
      }

      // If payment exists and is successful, initiate refund
      // Step 5: Handle refunds for successful payments
      for (const payment of booking.Payment) {
        if (payment.payment_status === "SUCCESS") {
          // In a real application, integrate with your payment provider to process the refund
          // For now, we'll just mark the payment as refunded
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              payment_status: "REFUNDED",
            },
          })

          // Record the refund transaction
          await prisma.transaction.create({
            data: {
              user_id: userId,
              transaction_type: "REFUND",
              amount: payment.amount_paid,
              status: "SUCCESS",
            },
          })
        }
      }

      // Update booking status
      const canceledBooking = await prisma.booking.update({
        where: { id },
        data: {
          status: "CANCELED",
        },
      })

      // Send cancellation notification
      await EmailService.sendBookingCancellation(booking.user.email, booking)
      if (booking.user.phone_number) {
        await SmsService.sendBookingCancellationSms(booking.user.phone_number, booking.id)
      }

      return {
        message: "Booking canceled successfully",
        booking: canceledBooking,
      }
    } catch (error) {
      logger.error(`Error in cancelBooking: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to cancel booking", 500)
    }
  }

  private static async validateHotelAvailability(hotelId: string, startDate: string, endDate: string) {
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      select: {
        available_rooms: true,
        bookings: {
          where: {
            status: {
              in: ["CONFIRMED", "PENDING"],
            },
            OR: [
              {
                // Booking starts during requested period
                start_date: {
                  gte: new Date(startDate),
                  lt: new Date(endDate),
                },
              },
              {
                // Booking ends during requested period
                end_date: {
                  gt: new Date(startDate),
                  lte: new Date(endDate),
                },
              },
              {
                // Booking spans the entire requested period
                AND: [
                  {
                    start_date: {
                      lte: new Date(startDate),
                    },
                  },
                  {
                    end_date: {
                      gte: new Date(endDate),
                    },
                  },
                ],
              },
            ],
          },
        },
      },
    })

    if (!hotel) {
      throw new AppError("Hotel not found", 404)
    }

    const bookedRoomsCount = hotel.bookings.length
    const availableRooms = hotel.available_rooms - bookedRoomsCount

    if (availableRooms <= 0) {
      throw new AppError("Hotel is fully booked for the selected dates", 400)
    }

    return true
  }

  private static async validateFlightAvailability(flightId: string) {
    const flight = await prisma.flight.findUnique({
      where: { id: flightId },
      include: {
        bookings: {
          where: {
            status: {
              in: ["CONFIRMED", "PENDING"],
            },
          },
        },
      },
    })

    if (!flight) {
      throw new AppError("Flight not found", 404)
    }

    // Assuming a default capacity of 200 seats
    const totalSeats = 200
    const bookedSeats = flight.bookings.length
    const availableSeats = totalSeats - bookedSeats

    if (availableSeats <= 0) {
      throw new AppError("Flight is fully booked", 400)
    }

    return true
  }

  private static async validateTripAvailability(tripId: string, startDate: string, endDate: string) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        bookings: {
          where: {
            status: {
              in: ["CONFIRMED", "PENDING"],
            },
            OR: [
              {
                // Booking starts during requested period
                start_date: {
                  gte: new Date(startDate),
                  lt: new Date(endDate),
                },
              },
              {
                // Booking ends during requested period
                end_date: {
                  gt: new Date(startDate),
                  lte: new Date(endDate),
                },
              },
              {
                // Booking spans the entire requested period
                AND: [
                  {
                    start_date: {
                      lte: new Date(startDate),
                    },
                  },
                  {
                    end_date: {
                      gte: new Date(endDate),
                    },
                  },
                ],
              },
            ],
          },
        },
      },
    })

    if (!trip) {
      throw new AppError("Trip not found", 404)
    }

    // Assuming a default capacity of 20 participants per trip
    const maxParticipants = 20
    const bookedParticipants = trip.bookings.length
    const availableSpots = maxParticipants - bookedParticipants

    if (availableSpots <= 0) {
      throw new AppError("Trip is fully booked for the selected dates", 400)
    }

    return true
  }

  private static async calculateHotelPrice(hotelId: string, startDate: string, endDate: string, guests: number) {
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      select: {
        price_per_night: true,
      },
    })

    if (!hotel) {
      throw new AppError("Hotel not found", 404)
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    // Base price calculation
    let totalPrice = hotel.price_per_night * nights

    // Add guest surcharge (assuming 20% extra per additional guest)
    if (guests > 1) {
      totalPrice += totalPrice * 0.2 * (guests - 1)
    }

    return totalPrice
  }

  private static async calculateFlightPrice(flightId: string, passengers: number) {
    const flight = await prisma.flight.findUnique({
      where: { id: flightId },
      select: {
        price: true,
      },
    })

    if (!flight) {
      throw new AppError("Flight not found", 404)
    }

    // Simple multiplication for flight price
    return flight.price * passengers
  }

  private static async calculateTripPrice(tripId: string, participants: number) {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: {
        price: true,
      },
    })

    if (!trip) {
      throw new AppError("Trip not found", 404)
    }

    // Simple multiplication for trip price
    return trip.price * participants
  }
}

import { prisma } from "../lib/prisma"
import { AppError } from "../utils/appError"
import { logger } from "../utils/logger"
import type { CreateFlightInput, UpdateFlightInput, SearchFlightsInput } from "../validators/flightValidators"
import type { PaginatedResult } from "../validators/commonValidators"

export class FlightService {
  static async createFlight(data: CreateFlightInput) {
    try {
      const flight = await prisma.flight.create({
        data: {
          flight_number: data.flight_number,
          airline: data.airline,
          departure_time: new Date(data.departure_time),
          arrival_time: new Date(data.arrival_time),
          from_airport: data.from_airport,
          to_airport: data.to_airport,
          price: data.price,
          seat_class: data.seat_class,
        },
      })

      return flight
    } catch (error) {
      logger.error(`Error in createFlight: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to create flight", 500)
    }
  }

  static async getFlights(params: SearchFlightsInput): Promise<PaginatedResult<any>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "departure_time",
        sortOrder = "asc",
        from,
        to,
        departure_date,
        seat_class,
        minPrice,
        maxPrice,
        airline,
      } = params

      // Calculate pagination values
      const skip = (page - 1) * limit

      // Build where conditions
      const where: any = {}

      if (from) {
        where.from_airport = {
          contains: from,
          mode: "insensitive",
        }
      }

      if (to) {
        where.to_airport = {
          contains: to,
          mode: "insensitive",
        }
      }

      if (departure_date) {
        const departureDate = new Date(departure_date)
        const nextDay = new Date(departureDate)
        nextDay.setDate(nextDay.getDate() + 1)

        where.departure_time = {
          gte: departureDate,
          lt: nextDay,
        }
      }

      if (seat_class) {
        where.seat_class = {
          equals: seat_class,
          mode: "insensitive",
        }
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {}
        if (minPrice !== undefined) {
          where.price.gte = minPrice
        }
        if (maxPrice !== undefined) {
          where.price.lte = maxPrice
        }
      }

      if (airline) {
        where.airline = {
          contains: airline,
          mode: "insensitive",
        }
      }

      // Get total count (without filters)
      const totalCount = await prisma.flight.count()

      // Get filtered count
      const filteredCount = await prisma.flight.count({ where })

      // Get paginated data
      const flights = await prisma.flight.findMany({
        where,
        include: {
          images: true,
          reviews: {
            select: {
              id: true,
              rating: true,
            },
          },
          _count: {
            select: {
              bookings: true,
              reviews: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      })

      // Process flights to include average rating and duration
      const processedFlights = flights.map((flight) => {
        const avgRating =
          flight.reviews.length > 0
            ? flight.reviews.reduce((sum, review) => sum + review.rating, 0) / flight.reviews.length
            : 0

        // Calculate flight duration in minutes
        const durationMs = flight.arrival_time.getTime() - flight.departure_time.getTime()
        const durationMinutes = Math.floor(durationMs / 60000)

        return {
          ...flight,
          avg_rating: avgRating,
          review_count: flight._count.reviews,
          booking_count: flight._count.bookings,
          duration_minutes: durationMinutes,
          reviews: undefined, // Remove raw reviews
          _count: undefined, // Remove count
        }
      })

      // Calculate total pages
      const totalPages = Math.ceil(filteredCount / limit)

      return {
        data: processedFlights,
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
      logger.error(`Error in getFlights: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to get flights", 500)
    }
  }

  static async getFlightById(id: string) {
    try {
      const flight = await prisma.flight.findUnique({
        where: { id },
        include: {
          images: true,
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  profile_picture: true,
                },
              },
            },
          },
          bookings: {
            where: {
              status: "CONFIRMED",
            },
            select: {
              id: true,
              user_id: true,
            },
          },
        },
      })

      if (!flight) {
        throw new AppError("Flight not found", 404)
      }

      // Calculate average rating
      const avgRating =
        flight.reviews.length > 0
          ? flight.reviews.reduce((sum, review) => sum + review.rating, 0) / flight.reviews.length
          : 0

      // Calculate flight duration in minutes
      const durationMs = flight.arrival_time.getTime() - flight.departure_time.getTime()
      const durationMinutes = Math.floor(durationMs / 60000)

      // Calculate available seats (assuming a default capacity of 200 seats)
      const totalSeats = 200
      const bookedSeats = flight.bookings.length
      const availableSeats = totalSeats - bookedSeats

      return {
        ...flight,
        avg_rating: avgRating,
        review_count: flight.reviews.length,
        duration_minutes: durationMinutes,
        total_seats: totalSeats,
        booked_seats: bookedSeats,
        available_seats: availableSeats,
        bookings: undefined, // Remove raw bookings
      }
    } catch (error) {
      logger.error(`Error in getFlightById: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to get flight", 500)
    }
  }

  static async updateFlight(id: string, data: UpdateFlightInput) {
    try {
      const flight = await prisma.flight.findUnique({
        where: { id },
      })

      if (!flight) {
        throw new AppError("Flight not found", 404)
      }

      const updatedFlight = await prisma.flight.update({
        where: { id },
        data: {
          flight_number: data.flight_number,
          airline: data.airline,
          departure_time: data.departure_time ? new Date(data.departure_time) : undefined,
          arrival_time: data.arrival_time ? new Date(data.arrival_time) : undefined,
          from_airport: data.from_airport,
          to_airport: data.to_airport,
          price: data.price,
          seat_class: data.seat_class,
        },
      })

      return updatedFlight
    } catch (error) {
      logger.error(`Error in updateFlight: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to update flight", 500)
    }
  }

  static async deleteFlight(id: string) {
    try {
      const flight = await prisma.flight.findUnique({
        where: { id },
      })

      if (!flight) {
        throw new AppError("Flight not found", 404)
      }

      // Check if flight has active bookings
      const activeBookings = await prisma.booking.count({
        where: {
          flight_id: id,
          status: {
            in: ["CONFIRMED", "PENDING"],
          },
        },
      })

      if (activeBookings > 0) {
        throw new AppError("Cannot delete flight with active bookings", 400)
      }

      // Delete flight images
      await prisma.image.deleteMany({
        where: { flightId: id },
      })

      // Delete flight reviews
      await prisma.review.deleteMany({
        where: { flight_id: id },
      })

      // Delete flight
      await prisma.flight.delete({
        where: { id },
      })

      return { message: "Flight deleted successfully" }
    } catch (error) {
      logger.error(`Error in deleteFlight: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to delete flight", 500)
    }
  }

  static async searchFlights(params: SearchFlightsInput): Promise<PaginatedResult<any>> {
    try {
      return this.getFlights(params)
    } catch (error) {
      logger.error(`Error in searchFlights: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to search flights", 500)
    }
  }

  static async getFlightAvailability(id: string) {
    try {
      const flight = await prisma.flight.findUnique({
        where: { id },
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

      return {
        flight_id: flight.id,
        flight_number: flight.flight_number,
        airline: flight.airline,
        departure_time: flight.departure_time,
        arrival_time: flight.arrival_time,
        from_airport: flight.from_airport,
        to_airport: flight.to_airport,
        total_seats: totalSeats,
        booked_seats: bookedSeats,
        available_seats: availableSeats,
        is_available: availableSeats > 0,
      }
    } catch (error) {
      logger.error(`Error in getFlightAvailability: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to check flight availability", 500)
    }
  }
}

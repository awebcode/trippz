import { prisma } from "../lib/prisma"
import { AppError } from "../utils/appError"
import { logger } from "../utils/logger"
import type { CreateTripInput, UpdateTripInput, SearchTripsInput } from "../validators/tripValidators"
import type { PaginatedResult } from "../validators/commonValidators"

export class TripService {
  static async createTrip(userId: string, data: CreateTripInput) {
    try {
      const trip = await prisma.trip.create({
        data: {
          user_id: userId,
          trip_name: data.trip_name,
          description: data.description,
          start_date: new Date(data.start_date),
          end_date: new Date(data.end_date),
          trip_type: data.trip_type,
          price: data.price,
        },
      })

      return trip
    } catch (error) {
      logger.error(`Error in createTrip: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to create trip", 500)
    }
  }

  static async getTrips(params: SearchTripsInput): Promise<PaginatedResult<any>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "created_at",
        sortOrder = "desc",
        trip_type,
        start_date,
        end_date,
        minPrice,
        maxPrice,
      } = params

      // Calculate pagination values
      const skip = (page - 1) * limit

      // Build where conditions
      const where: any = {}

      if (trip_type) {
        where.trip_type = trip_type
      }

      if (start_date) {
        where.start_date = {
          gte: new Date(start_date),
        }
      }

      if (end_date) {
        where.end_date = {
          lte: new Date(end_date),
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

      // Get total count (without filters)
      const totalCount = await prisma.trip.count()

      // Get filtered count
      const filteredCount = await prisma.trip.count({ where })

      // Get paginated data
      const trips = await prisma.trip.findMany({
        where,
        include: {
          images: true,
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              profile_picture: true,
            },
          },
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

      // Process trips to include average rating and duration
      const processedTrips = trips.map((trip) => {
        const avgRating =
          trip.reviews.length > 0
            ? trip.reviews.reduce((sum, review) => sum + review.rating, 0) / trip.reviews.length
            : 0

        // Calculate trip duration in days
        const durationMs = trip.end_date.getTime() - trip.start_date.getTime()
        const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24))

        return {
          ...trip,
          avg_rating: avgRating,
          review_count: trip._count.reviews,
          booking_count: trip._count.bookings,
          duration_days: durationDays,
          reviews: undefined, // Remove raw reviews
          _count: undefined, // Remove count
        }
      })

      // Calculate total pages
      const totalPages = Math.ceil(filteredCount / limit)

      return {
        data: processedTrips,
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
      logger.error(`Error in getTrips: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to get trips", 500)
    }
  }

  static async getTripById(id: string) {
    try {
      const trip = await prisma.trip.findUnique({
        where: { id },
        include: {
          images: true,
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              profile_picture: true,
            },
          },
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
              start_date: true,
              end_date: true,
            },
          },
        },
      })

      if (!trip) {
        throw new AppError("Trip not found", 404)
      }

      // Calculate average rating
      const avgRating =
        trip.reviews.length > 0 ? trip.reviews.reduce((sum, review) => sum + review.rating, 0) / trip.reviews.length : 0

      // Calculate trip duration in days
      const durationMs = trip.end_date.getTime() - trip.start_date.getTime()
      const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24))

      // Get booked dates
      const bookedDates = trip.bookings.map((booking) => ({
        start: booking.start_date,
        end: booking.end_date,
      }))

      return {
        ...trip,
        avg_rating: avgRating,
        review_count: trip.reviews.length,
        duration_days: durationDays,
        booked_dates: bookedDates,
        bookings: undefined, // Remove raw bookings
      }
    } catch (error) {
      logger.error(`Error in getTripById: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to get trip", 500)
    }
  }

  static async updateTrip(userId: string, id: string, data: UpdateTripInput) {
    try {
      const trip = await prisma.trip.findUnique({
        where: { id },
      })

      if (!trip) {
        throw new AppError("Trip not found", 404)
      }

      if (trip.user_id !== userId) {
        throw new AppError("You are not authorized to update this trip", 403)
      }

      const updatedTrip = await prisma.trip.update({
        where: { id },
        data: {
          trip_name: data.trip_name,
          description: data.description,
          start_date: data.start_date ? new Date(data.start_date) : undefined,
          end_date: data.end_date ? new Date(data.end_date) : undefined,
          trip_type: data.trip_type,
          price: data.price,
        },
      })

      return updatedTrip
    } catch (error) {
      logger.error(`Error in updateTrip: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to update trip", 500)
    }
  }

  static async deleteTrip(userId: string, id: string) {
    try {
      const trip = await prisma.trip.findUnique({
        where: { id },
      })

      if (!trip) {
        throw new AppError("Trip not found", 404)
      }

      if (trip.user_id !== userId) {
        throw new AppError("You are not authorized to delete this trip", 403)
      }

      // Check if trip has active bookings
      const activeBookings = await prisma.booking.count({
        where: {
          trip_id: id,
          status: {
            in: ["CONFIRMED", "PENDING"],
          },
        },
      })

      if (activeBookings > 0) {
        throw new AppError("Cannot delete trip with active bookings", 400)
      }

      // Delete trip images
      await prisma.image.deleteMany({
        where: { trip_id: id },
      })

      // Delete trip reviews
      await prisma.review.deleteMany({
        where: { trip_id: id },
      })

      // Delete trip
      await prisma.trip.delete({
        where: { id },
      })

      return { message: "Trip deleted successfully" }
    } catch (error) {
      logger.error(`Error in deleteTrip: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to delete trip", 500)
    }
  }

  static async searchTrips(params: SearchTripsInput): Promise<PaginatedResult<any>> {
    try {
      return this.getTrips(params)
    } catch (error) {
      logger.error(`Error in searchTrips: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to search trips", 500)
    }
  }

  static async getTripAvailability(id: string, startDate: string, endDate: string) {
    try {
      const trip = await prisma.trip.findUnique({
        where: { id },
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
      const availableSpots = Math.max(0, maxParticipants - bookedParticipants)

      return {
        trip_id: trip.id,
        trip_name: trip.trip_name,
        trip_type: trip.trip_type,
        max_participants: maxParticipants,
        booked_participants: bookedParticipants,
        available_spots: availableSpots,
        is_available: availableSpots > 0,
        requested_period: {
          start_date: startDate,
          end_date: endDate,
        },
      }
    } catch (error) {
      logger.error(`Error in getTripAvailability: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to check trip availability", 500)
    }
  }
}

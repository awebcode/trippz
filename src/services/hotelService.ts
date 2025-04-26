import { prisma } from "../lib/prisma"
import { AppError } from "../utils/appError"
import { logger } from "../utils/logger"
import type { CreateHotelInput, UpdateHotelInput, SearchHotelsInput } from "../validators/hotelValidators"
import type { PaginatedResult } from "../validators/commonValidators"

export class HotelService {
  static async createHotel(data: CreateHotelInput) {
    try {
      const hotel = await prisma.hotel.create({
        data: {
          name: data.name,
          address: data.address,
          rating: data.rating,
          price_per_night: data.price_per_night,
          amenities: data.amenities,
          available_rooms: data.available_rooms,
        },
      })

      return hotel
    } catch (error) {
      logger.error(`Error in createHotel: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to create hotel", 500)
    }
  }

  static async getHotels(params: SearchHotelsInput): Promise<PaginatedResult<any>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "created_at",
        sortOrder = "desc",
        location,
        rating,
        amenities,
        minPrice,
        maxPrice,
      } = params

      // Calculate pagination values
      const skip = (page - 1) * limit

      // Build where conditions
      const where: any = {}

      if (location) {
        where.address = {
          contains: location,
          mode: "insensitive",
        }
      }

      if (rating !== undefined) {
        where.rating = {
          gte: rating,
        }
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price_per_night = {}
        if (minPrice !== undefined) {
          where.price_per_night.gte = minPrice
        }
        if (maxPrice !== undefined) {
          where.price_per_night.lte = maxPrice
        }
      }

      if (amenities && amenities.length > 0) {
        where.amenities = {
          hasSome: amenities,
        }
      }

      // Get total count (without filters)
      const totalCount = await prisma.hotel.count()

      // Get filtered count
      const filteredCount = await prisma.hotel.count({ where })

      // Get paginated data
      const hotels = await prisma.hotel.findMany({
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

      // Process hotels to include average rating
      const processedHotels = hotels.map((hotel) => {
        const avgRating =
          hotel.reviews.length > 0
            ? hotel.reviews.reduce((sum, review) => sum + review.rating, 0) / hotel.reviews.length
            : 0

        return {
          ...hotel,
          avg_rating: avgRating,
          review_count: hotel._count.reviews,
          booking_count: hotel._count.bookings,
          reviews: undefined, // Remove raw reviews
          _count: undefined, // Remove count
        }
      })

      // Calculate total pages
      const totalPages = Math.ceil(filteredCount / limit)

      return {
        data: processedHotels,
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
      logger.error(`Error in getHotels: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to get hotels", 500)
    }
  }

  static async getHotelById(id: string) {
    try {
      const hotel = await prisma.hotel.findUnique({
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
              start_date: true,
              end_date: true,
            },
          },
        },
      })

      if (!hotel) {
        throw new AppError("Hotel not found", 404)
      }

      // Calculate average rating
      const avgRating =
        hotel.reviews.length > 0
          ? hotel.reviews.reduce((sum, review) => sum + review.rating, 0) / hotel.reviews.length
          : 0

      // Get booked dates
      const bookedDates = hotel.bookings.map((booking) => ({
        start: booking.start_date,
        end: booking.end_date,
      }))

      return {
        ...hotel,
        avg_rating: avgRating,
        review_count: hotel.reviews.length,
        booked_dates: bookedDates,
        bookings: undefined, // Remove raw bookings
      }
    } catch (error) {
      logger.error(`Error in getHotelById: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to get hotel", 500)
    }
  }

  static async updateHotel(id: string, data: UpdateHotelInput) {
    try {
      const hotel = await prisma.hotel.findUnique({
        where: { id },
      })

      if (!hotel) {
        throw new AppError("Hotel not found", 404)
      }

      const updatedHotel = await prisma.hotel.update({
        where: { id },
        data: {
          name: data.name,
          address: data.address,
          rating: data.rating,
          price_per_night: data.price_per_night,
          amenities: data.amenities,
          available_rooms: data.available_rooms,
        },
      })

      return updatedHotel
    } catch (error) {
      logger.error(`Error in updateHotel: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to update hotel", 500)
    }
  }

  static async deleteHotel(id: string) {
    try {
      const hotel = await prisma.hotel.findUnique({
        where: { id },
      })

      if (!hotel) {
        throw new AppError("Hotel not found", 404)
      }

      // Check if hotel has active bookings
      const activeBookings = await prisma.booking.count({
        where: {
          hotel_id: id,
          status: {
            in: ["CONFIRMED", "PENDING"],
          },
        },
      })

      if (activeBookings > 0) {
        throw new AppError("Cannot delete hotel with active bookings", 400)
      }

      // Delete hotel images
      await prisma.image.deleteMany({
        where: { hotel_id: id },
      })

      // Delete hotel reviews
      await prisma.review.deleteMany({
        where: { hotel_id: id },
      })

      // Delete hotel
      await prisma.hotel.delete({
        where: { id },
      })

      return { message: "Hotel deleted successfully" }
    } catch (error) {
      logger.error(`Error in deleteHotel: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to delete hotel", 500)
    }
  }

  static async searchHotels(params: SearchHotelsInput): Promise<PaginatedResult<any>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "created_at",
        sortOrder = "desc",
        location,
        check_in,
        check_out,
        guests,
        minPrice,
        maxPrice,
        amenities,
        rating,
      } = params

      // Calculate pagination values
      const skip = (page - 1) * limit

      // Build where conditions
      const where: any = {}

      if (location) {
        where.address = {
          contains: location,
          mode: "insensitive",
        }
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price_per_night = {}
        if (minPrice !== undefined) {
          where.price_per_night.gte = minPrice
        }
        if (maxPrice !== undefined) {
          where.price_per_night.lte = maxPrice
        }
      }

      if (rating !== undefined) {
        where.rating = {
          gte: rating,
        }
      }

      if (amenities && amenities.length > 0) {
        where.amenities = {
          hasSome: amenities,
        }
      }

      if (guests !== undefined) {
        where.available_rooms = {
          gte: 1, // At least one room available
        }
      }

      // Filter out hotels with bookings in the requested date range
      if (check_in && check_out) {
        const checkInDate = new Date(check_in)
        const checkOutDate = new Date(check_out)

        where.bookings = {
          none: {
            AND: [
              {
                status: {
                  in: ["CONFIRMED", "PENDING"],
                },
              },
              {
                OR: [
                  {
                    // Booking starts during requested period
                    start_date: {
                      gte: checkInDate,
                      lt: checkOutDate,
                    },
                  },
                  {
                    // Booking ends during requested period
                    end_date: {
                      gt: checkInDate,
                      lte: checkOutDate,
                    },
                  },
                  {
                    // Booking spans the entire requested period
                    AND: [
                      {
                        start_date: {
                          lte: checkInDate,
                        },
                      },
                      {
                        end_date: {
                          gte: checkOutDate,
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
        }
      }

      // Get total count (without filters)
      const totalCount = await prisma.hotel.count()

      // Get filtered count
      const filteredCount = await prisma.hotel.count({ where })

      // Get paginated data
      const hotels = await prisma.hotel.findMany({
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

      // Process hotels to include average rating
      const processedHotels = hotels.map((hotel) => {
        const avgRating =
          hotel.reviews.length > 0
            ? hotel.reviews.reduce((sum, review) => sum + review.rating, 0) / hotel.reviews.length
            : 0

        return {
          ...hotel,
          avg_rating: avgRating,
          review_count: hotel._count.reviews,
          booking_count: hotel._count.bookings,
          reviews: undefined, // Remove raw reviews
          _count: undefined, // Remove count
        }
      })

      // Calculate total pages
      const totalPages = Math.ceil(filteredCount / limit)

      return {
        data: processedHotels,
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
      logger.error(`Error in searchHotels: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to search hotels", 500)
    }
  }

  static async getHotelAvailability(id: string, startDate: string, endDate: string) {
    try {
      const hotel = await prisma.hotel.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
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
            select: {
              id: true,
              start_date: true,
              end_date: true,
            },
          },
        },
      })

      if (!hotel) {
        throw new AppError("Hotel not found", 404)
      }

      const bookedRoomsCount = hotel.bookings.length
      const availableRooms = Math.max(0, hotel.available_rooms - bookedRoomsCount)

      return {
        hotel_id: hotel.id,
        hotel_name: hotel.name,
        total_rooms: hotel.available_rooms,
        booked_rooms: bookedRoomsCount,
        available_rooms: availableRooms,
        is_available: availableRooms > 0,
        requested_period: {
          start_date: startDate,
          end_date: endDate,
        },
      }
    } catch (error) {
      logger.error(`Error in getHotelAvailability: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to check hotel availability", 500)
    }
  }
}

import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";
import { logger } from "../utils/logger";
import type {
  CreateHotelInput,
  UpdateHotelInput,
  SearchHotelsInput,
  HotelAvailabilityInput,
} from "../validators/hotelValidators";
import type { PaginatedResult } from "../validators/commonValidators";

export class HotelService {
  static async createHotel(data: CreateHotelInput) {
    try {
      const hotel = await prisma.hotel.create({
        data: {
          name: data.name,
          address: data.address,
          rating: data.rating as any,
          price_per_night: data.price_per_night,
          amenities: data.amenities,
          available_rooms: data.available_rooms as any,
          description: data.description,
          check_in_time: data.check_in_time,
          check_out_time: data.check_out_time,
          location: data.location,
          cancellation_policy: data.cancellation_policy,
        },
      });

      return hotel;
    } catch (error) {
      logger.error(`Error in createHotel: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to create hotel", 500);
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
        city,
        country,
        check_in,
        check_out,
        guests,
        rooms,
        minPrice,
        maxPrice,
        rating,
        amenities,
        distance_from_center,
        has_free_cancellation,
        has_breakfast_included,
        has_parking,
        has_pool,
        has_gym,
        has_restaurant,
        has_room_service,
        has_spa,
        has_wifi,
        has_air_conditioning,
        is_pet_friendly,
        is_family_friendly,
      } = params;

      // Calculate pagination values
      const skip = (page - 1) * limit;

      // Build where conditions
      const where: any = {};

      if (location) {
        where.address = {
          contains: location,
          mode: "insensitive",
        };
      }

      if (city) {
        where.OR = where.OR || [];
        where.OR.push({
          address: {
            contains: city,
            mode: "insensitive",
          },
        });

        if (where.location) {
          where.OR.push({
            location: {
              path: ["city"],
              string_contains: city,
            },
          });
        }
      }

      if (country) {
        where.OR = where.OR || [];
        where.OR.push({
          address: {
            contains: country,
            mode: "insensitive",
          },
        });

        if (where.location) {
          where.OR.push({
            location: {
              path: ["country"],
              string_contains: country,
            },
          });
        }
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price_per_night = {};
        if (minPrice !== undefined) {
          where.price_per_night.gte = minPrice;
        }
        if (maxPrice !== undefined) {
          where.price_per_night.lte = maxPrice;
        }
      }

      if (rating !== undefined) {
        where.rating = {
          gte: rating,
        };
      }

      if (amenities && amenities.length > 0) {
        where.amenities = {
          hasSome: amenities,
        };
      }

      // Advanced amenity filters
      const amenityFilters = [
        { field: "has_free_cancellation", value: has_free_cancellation },
        { field: "has_breakfast_included", value: has_breakfast_included },
        { field: "has_parking", value: has_parking },
        { field: "has_pool", value: has_pool },
        { field: "has_gym", value: has_gym },
        { field: "has_restaurant", value: has_restaurant },
        { field: "has_room_service", value: has_room_service },
        { field: "has_spa", value: has_spa },
        { field: "has_wifi", value: has_wifi },
        { field: "has_air_conditioning", value: has_air_conditioning },
        { field: "is_pet_friendly", value: is_pet_friendly },
        { field: "is_family_friendly", value: is_family_friendly },
      ];

      // Add each amenity filter if it's defined
      amenityFilters.forEach((filter) => {
        if (filter.value !== undefined) {
          // For each amenity, check if it's in the amenities array
          if (filter.value === true) {
            where.amenities = where.amenities || {};
            where.amenities.hasSome = where.amenities.hasSome || [];
            where.amenities.hasSome.push(
              filter.field.replace("has_", "").replace("is_", "")
            );
          }
        }
      });

      if (guests !== undefined) {
        where.available_rooms = {
          gte: 1, // At least one room available
        };
      }

      if (rooms !== undefined) {
        where.available_rooms = {
          gte: rooms,
        };
      }

      // Filter out hotels with bookings in the requested date range
      if (check_in && check_out) {
        const checkInDate = new Date(check_in);
        const checkOutDate = new Date(check_out);

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
        };
      }

      // Get total count (without filters)
      const totalCount = await prisma.hotel.count();

      // Get filtered count
      const filteredCount = await prisma.hotel.count({ where });

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
      });

      // Process hotels to include average rating
      const processedHotels = hotels.map((hotel) => {
        const avgRating =
          hotel.reviews.length > 0
            ? hotel.reviews.reduce((sum, review) => sum + review.rating, 0) /
              hotel.reviews.length
            : 0;

        return {
          ...hotel,
          avg_rating: avgRating,
          review_count: hotel._count.reviews,
          booking_count: hotel._count.bookings,
          reviews: undefined, // Remove raw reviews
          _count: undefined, // Remove count
        };
      });

      // Calculate total pages
      const totalPages = Math.ceil(filteredCount / limit);

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
      };
    } catch (error) {
      logger.error(`Error in getHotels: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to get hotels", 500);
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
      });

      if (!hotel) {
        throw new AppError("Hotel not found", 404);
      }

      // Calculate average rating
      const avgRating =
        hotel.reviews.length > 0
          ? hotel.reviews.reduce((sum, review) => sum + review.rating, 0) /
            hotel.reviews.length
          : 0;

      // Get booked dates
      const bookedDates = hotel.bookings.map((booking) => ({
        start: booking.start_date,
        end: booking.end_date,
      }));

      return {
        ...hotel,
        avg_rating: avgRating,
        review_count: hotel.reviews.length,
        booked_dates: bookedDates,
        bookings: undefined, // Remove raw bookings
      };
    } catch (error) {
      logger.error(`Error in getHotelById: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to get hotel", 500);
    }
  }

  static async updateHotel(id: string, data: UpdateHotelInput) {
    try {
      const hotel = await prisma.hotel.findUnique({
        where: { id },
      });

      if (!hotel) {
        throw new AppError("Hotel not found", 404);
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
          description: data.description,
          check_in_time: data.check_in_time,
          check_out_time: data.check_out_time,
          location: data.location,
          cancellation_policy: data.cancellation_policy,
        },
      });

      return updatedHotel;
    } catch (error) {
      logger.error(`Error in updateHotel: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to update hotel", 500);
    }
  }

  static async deleteHotel(id: string) {
    try {
      const hotel = await prisma.hotel.findUnique({
        where: { id },
      });

      if (!hotel) {
        throw new AppError("Hotel not found", 404);
      }

      // Check if hotel has active bookings
      const activeBookings = await prisma.booking.count({
        where: {
          hotel_id: id,
          status: {
            in: ["CONFIRMED", "PENDING"],
          },
        },
      });

      if (activeBookings > 0) {
        throw new AppError("Cannot delete hotel with active bookings", 400);
      }

      // Delete hotel images
      await prisma.image.deleteMany({
        where: { hotel_id: id },
      });

      // Delete hotel reviews
      await prisma.review.deleteMany({
        where: { hotel_id: id },
      });

      // Delete hotel
      await prisma.hotel.delete({
        where: { id },
      });

      return { message: "Hotel deleted successfully" };
    } catch (error) {
      logger.error(`Error in deleteHotel: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to delete hotel", 500);
    }
  }

  static async searchHotels(params: SearchHotelsInput): Promise<PaginatedResult<any>> {
    try {
      return this.getHotels(params);
    } catch (error) {
      logger.error(`Error in searchHotels: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to search hotels", 500);
    }
  }

  static async getHotelAvailability(params: HotelAvailabilityInput) {
    try {
      const { hotel_id, check_in, check_out, guests = 1, rooms = 1 } = params;

      const hotel = await prisma.hotel.findUnique({
        where: { id: hotel_id },
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
                    gte: new Date(check_in),
                    lt: new Date(check_out),
                  },
                },
                {
                  // Booking ends during requested period
                  end_date: {
                    gt: new Date(check_in),
                    lte: new Date(check_out),
                  },
                },
                {
                  // Booking spans the entire requested period
                  AND: [
                    {
                      start_date: {
                        lte: new Date(check_in),
                      },
                    },
                    {
                      end_date: {
                        gte: new Date(check_out),
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
      });

      if (!hotel) {
        throw new AppError("Hotel not found", 404);
      }

      const bookedRoomsCount = hotel.bookings.length;
      const availableRooms = Math.max(0, hotel?.available_rooms - bookedRoomsCount);
      const canAccommodate = availableRooms >= rooms;

      return {
        hotel_id: hotel.id,
        hotel_name: hotel.name,
        total_rooms: hotel.available_rooms,
        booked_rooms: bookedRoomsCount,
        available_rooms: availableRooms,
        requested_rooms: rooms,
        requested_guests: guests,
        is_available: canAccommodate,
        requested_period: {
          check_in: check_in,
          check_out: check_out,
        },
      };
    } catch (error) {
      logger.error(`Error in getHotelAvailability: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to check hotel availability", 500);
    }
  }

  // Custom query method for advanced hotel searches
  static async customHotelQuery(params: any): Promise<PaginatedResult<any>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "created_at",
        sortOrder = "desc",
        // Custom query parameters
        nearby_attractions,
        nearby_landmarks,
        nearby_restaurants,
        nearby_shopping,
        nearby_public_transport,
        distance_radius,
        property_type,
        star_rating,
        guest_rating_min,
        room_types,
        ...rest
      } = params;

      // Calculate pagination values
      const skip = (page - 1) * limit;

      // Build advanced where conditions
      const where: any = {};

      // Reuse basic filters from getHotels
      if (rest.location) {
        where.address = {
          contains: rest.location,
          mode: "insensitive",
        };
      }

      if (rest.minPrice !== undefined || rest.maxPrice !== undefined) {
        where.price_per_night = {};
        if (rest.minPrice !== undefined) {
          where.price_per_night.gte = rest.minPrice;
        }
        if (rest.maxPrice !== undefined) {
          where.price_per_night.lte = rest.maxPrice;
        }
      }

      // Add property type filter
      if (property_type) {
        where.property_type = property_type;
      }

      // Add star rating filter (exact match)
      if (star_rating) {
        where.rating = star_rating;
      }

      // Add guest rating filter (minimum)
      if (guest_rating_min) {
        // This will be applied after fetching the data
        logger.info(`Filtering for minimum guest rating: ${guest_rating_min}`);
      }

      // Add room types filter
      if (room_types && room_types.length > 0) {
        // This would typically be a join to a room_types table
        // For now, we'll log it as a placeholder
        logger.info(`Filtering for room types: ${room_types.join(", ")}`);
      }

      // Get filtered count
      const filteredCount = await prisma.hotel.count({ where });

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
      });

      // Process hotels to include average rating
      let processedHotels = hotels.map((hotel) => {
        const avgRating =
          hotel.reviews.length > 0
            ? hotel.reviews.reduce((sum, review) => sum + review.rating, 0) /
              hotel.reviews.length
            : 0;

        return {
          ...hotel,
          avg_rating: avgRating,
          review_count: hotel._count.reviews,
          booking_count: hotel._count.bookings,
          reviews: undefined,
          _count: undefined,
        };
      });

      // Apply post-fetch filters
      if (guest_rating_min) {
        processedHotels = processedHotels.filter(
          (hotel) => hotel.avg_rating >= guest_rating_min
        );
      }

      // Calculate total pages
      const totalPages = Math.ceil(filteredCount / limit);

      return {
        data: processedHotels,
        metadata: {
          totalCount: await prisma.hotel.count(),
          filteredCount: processedHotels.length,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    } catch (error) {
      logger.error(`Error in customHotelQuery: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to execute custom hotel query", 500);
    }
  }
}

import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";
import { logger } from "../utils/logger";
import type {
  CreateFlightInput,
  UpdateFlightInput,
  SearchFlightsInput,
  FlightAvailabilityInput,
} from "../validators/flightValidators";
import type { PaginatedResult } from "../validators/commonValidators";

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
          available_seats: data.available_seats,
          aircraft_type: data.aircraft_type,
          has_wifi: data.has_wifi,
          has_entertainment: data.has_entertainment,
          has_power_outlets: data.has_power_outlets,
          meal_service: data.meal_service,
          baggage_allowance: data.baggage_allowance,
          cancellation_policy: data.cancellation_policy,
        },
      });

      return flight;
    } catch (error) {
      logger.error(`Error in createFlight: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to create flight", 500);
    }
  }

  static async getFlights(
    params: SearchFlightsInput = {} as SearchFlightsInput,
  ): Promise<PaginatedResult<any>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "departure_time",
        sortOrder = "asc",
        search,
        from,
        to,
        departure_date,
        return_date,
        seat_class,
        minPrice,
        maxPrice,
        airline,
        direct_flights_only,
        has_wifi,
        has_entertainment,
        has_power_outlets,
        meal_service,
        min_baggage_allowance,
      } = params;


      // Calculate pagination values
      const skip = (page - 1) * limit;

      // Build where conditions
      const where: any = {};

      if (search) {
        where.OR = [
          { flight_number: { contains: search, mode: "insensitive" } },
          { airline: { contains: search, mode: "insensitive" } },
          { from_airport: { contains: search, mode: "insensitive" } },
          { to_airport: { contains: search, mode: "insensitive" } },
        ];
      }

      if (from) {
        where.from_airport = {
          contains: from,
          mode: "insensitive",
        };
      }

      if (to) {
        where.to_airport = {
          contains: to,
          mode: "insensitive",
        };
      }

      if (departure_date) {
        const departureDate = new Date(departure_date);
        const nextDay = new Date(departureDate);
        nextDay.setDate(nextDay.getDate() + 1);

        where.departure_time = {
          gte: departureDate,
          lt: nextDay,
        };
      }

      if (return_date) {
        // For return flights, we would typically query a separate set
        // This is a placeholder for return flight logic
        logger.info(`Return date filter: ${return_date}`);
      }

      if (seat_class) {
        where.seat_class = {
          equals: seat_class,
          mode: "insensitive",
        };
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {};
        if (minPrice !== undefined) {
          where.price.gte = minPrice;
        }
        if (maxPrice !== undefined) {
          where.price.lte = maxPrice;
        }
      }

      if (airline) {
        where.airline = {
          contains: airline,
          mode: "insensitive",
        };
      }

      // Add filters for amenities
      if (has_wifi !== undefined) {
        where.has_wifi = has_wifi;
      }

      if (has_entertainment !== undefined) {
        where.has_entertainment = has_entertainment;
      }

      if (has_power_outlets !== undefined) {
        where.has_power_outlets = has_power_outlets;
      }

      if (meal_service !== undefined) {
        where.meal_service = meal_service;
      }

      if (min_baggage_allowance !== undefined) {
        where.baggage_allowance = {
          gte: min_baggage_allowance,
        };
      }

      // Direct flights only logic would go here
      if (direct_flights_only) {
        // This is a placeholder for direct flights logic
        // In a real implementation, this would filter out flights with connections
        logger.info("Filtering for direct flights only");
      }

      // Get total count (without filters)
      const totalCount = await prisma.flight.count();

      // Get filtered count
      const filteredCount = await prisma.flight.count({ where });

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
      });

      // Process flights to include average rating and duration
      const processedFlights = flights.map((flight) => {
        const avgRating =
          flight.reviews.length > 0
            ? flight.reviews.reduce((sum, review) => sum + review.rating, 0) /
              flight.reviews.length
            : 0;

        // Calculate flight duration in minutes
        const durationMs =
          flight.arrival_time.getTime() - flight.departure_time.getTime();
        const durationMinutes = Math.floor(durationMs / 60000);

        return {
          ...flight,
          avg_rating: avgRating,
          review_count: flight._count.reviews,
          booking_count: flight._count.bookings,
          duration_minutes: durationMinutes,
          reviews: undefined, // Remove raw reviews
          _count: undefined, // Remove count
        };
      });

      // Calculate total pages
      const totalPages = Math.ceil(filteredCount / limit);

      return {
        metadata: {
          totalCount,
          filteredCount,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
        data: processedFlights,
      };
    } catch (error) {
      logger.error(`Error in getFlights: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to get flights", 500);
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
      });

      if (!flight) {
        throw new AppError("Flight not found", 404);
      }

      // Calculate average rating
      const avgRating =
        flight.reviews.length > 0
          ? flight.reviews.reduce((sum, review) => sum + review.rating, 0) /
            flight.reviews.length
          : 0;

      // Calculate flight duration in minutes
      const durationMs = flight.arrival_time.getTime() - flight.departure_time.getTime();
      const durationMinutes = Math.floor(durationMs / 60000);

      // Calculate available seats
      const totalSeats = flight.available_seats || 200; // Default to 200 if not specified
      const bookedSeats = flight.bookings.length;
      const availableSeats = totalSeats - bookedSeats;

      return {
        ...flight,
        avg_rating: avgRating,
        review_count: flight.reviews.length,
        duration_minutes: durationMinutes,
        total_seats: totalSeats,
        booked_seats: bookedSeats,
        available_seats: availableSeats,
        bookings: undefined, // Remove raw bookings
      };
    } catch (error) {
      logger.error(`Error in getFlightById: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to get flight", 500);
    }
  }

  static async updateFlight(id: string, data: UpdateFlightInput) {
    try {
      const flight = await prisma.flight.findUnique({
        where: { id },
      });

      if (!flight) {
        throw new AppError("Flight not found", 404);
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
          available_seats: data.available_seats,
          aircraft_type: data.aircraft_type,
          has_wifi: data.has_wifi,
          has_entertainment: data.has_entertainment,
          has_power_outlets: data.has_power_outlets,
          meal_service: data.meal_service,
          baggage_allowance: data.baggage_allowance,
          cancellation_policy: data.cancellation_policy,
        },
      });

      return updatedFlight;
    } catch (error) {
      logger.error(`Error in updateFlight: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to update flight", 500);
    }
  }

  static async deleteFlight(id: string) {
    try {
      const flight = await prisma.flight.findUnique({
        where: { id },
      });

      if (!flight) {
        throw new AppError("Flight not found", 404);
      }

      // Check if flight has active bookings
      const activeBookings = await prisma.booking.count({
        where: {
          flight_id: id,
          status: {
            in: ["CONFIRMED", "PENDING"],
          },
        },
      });

      if (activeBookings > 0) {
        throw new AppError("Cannot delete flight with active bookings", 400);
      }

      // Delete flight images
      await prisma.image.deleteMany({
        where: { flightId: id },
      });

      // Delete flight reviews
      await prisma.review.deleteMany({
        where: { flight_id: id },
      });

      // Delete flight
      await prisma.flight.delete({
        where: { id },
      });

      return { message: "Flight deleted successfully" };
    } catch (error) {
      logger.error(`Error in deleteFlight: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to delete flight", 500);
    }
  }

  static async searchFlights(params: SearchFlightsInput= {} as SearchFlightsInput): Promise<PaginatedResult<any>> {
    try {
      return this.getFlights(params);
    } catch (error) {
      logger.error(`Error in searchFlights: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to search flights", 500);
    }
  }

  static async getFlightAvailability(params: FlightAvailabilityInput= {} as FlightAvailabilityInput) {
    try {
      const { flight_id, date, passengers = 1 } = params;

      const flight = await prisma.flight.findUnique({
        where: { id: flight_id },
        include: {
          bookings: {
            where: {
              status: {
                in: ["CONFIRMED", "PENDING"],
              },
              ...(date
                ? {
                    // If date is provided, filter bookings for that date
                    start_date: {
                      lte: new Date(date),
                    },
                    end_date: {
                      gte: new Date(date),
                    },
                  }
                : {}),
            },
          },
        },
      });

      if (!flight) {
        throw new AppError("Flight not found", 404);
      }

      // Calculate available seats
      const totalSeats = flight.available_seats || 200; // Default to 200 if not specified
      const bookedSeats = flight.bookings.length;
      const availableSeats = totalSeats - bookedSeats;
      const canAccommodate = availableSeats >= passengers;

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
        requested_passengers: passengers,
        is_available: canAccommodate,
        requested_date: date ? new Date(date) : flight.departure_time,
      };
    } catch (error) {
      logger.error(`Error in getFlightAvailability: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to check flight availability", 500);
    }
  }

  // Custom query method for advanced flight searches
  static async customFlightQuery(params={} as  any): Promise<PaginatedResult<any>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "departure_time",
        sortOrder = "asc",
        // Custom query parameters
        layover_max_hours,
        preferred_airlines,
        exclude_airlines,
        departure_time_start,
        departure_time_end,
        arrival_time_start,
        arrival_time_end,
        price_range,
        duration_max_minutes,
        ...rest
      } = params;

      // Calculate pagination values
      const skip = (page - 1) * limit;

      // Build advanced where conditions
      const where: any = {};

      // Basic filters (reusing logic from getFlights)
      if (params.from) {
        where.from_airport = {
          contains: params.from,
          mode: "insensitive",
        };
      }

      if (params.to) {
        where.to_airport = {
          contains: params.to,
          mode: "insensitive",
        };
      }

      // Advanced time-based filters
      if (departure_time_start || departure_time_end) {
        where.departure_time = {};
        if (departure_time_start) {
          where.departure_time.gte = new Date(departure_time_start);
        }
        if (departure_time_end) {
          where.departure_time.lte = new Date(departure_time_end);
        }
      }

      if (arrival_time_start || arrival_time_end) {
        where.arrival_time = {};
        if (arrival_time_start) {
          where.arrival_time.gte = new Date(arrival_time_start);
        }
        if (arrival_time_end) {
          where.arrival_time.lte = new Date(arrival_time_end);
        }
      }

      // Airline preferences
      if (preferred_airlines && preferred_airlines.length > 0) {
        where.airline = {
          in: preferred_airlines,
        };
      }

      if (exclude_airlines && exclude_airlines.length > 0) {
        where.airline = {
          ...where.airline,
          notIn: exclude_airlines,
        };
      }

      // Price range (if not already set by minPrice/maxPrice)
      if (price_range && !where.price) {
        const [min, max] = price_range.split("-").map(Number);
        where.price = {
          gte: min,
          lte: max,
        };
      }

      // Get filtered count
      const filteredCount = await prisma.flight.count({ where });

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
      });

      // Process flights to include average rating and duration
      const processedFlights = flights
        .map((flight) => {
          const avgRating =
            flight.reviews.length > 0
              ? flight.reviews.reduce((sum, review) => sum + review.rating, 0) /
                flight.reviews.length
              : 0;

          // Calculate flight duration in minutes
          const durationMs =
            flight.arrival_time.getTime() - flight.departure_time.getTime();
          const durationMinutes = Math.floor(durationMs / 60000);

          // Filter out flights that exceed maximum duration if specified
          if (duration_max_minutes && durationMinutes > duration_max_minutes) {
            return null;
          }

          return {
            ...flight,
            avg_rating: avgRating,
            review_count: flight._count.reviews,
            booking_count: flight._count.bookings,
            duration_minutes: durationMinutes,
            reviews: undefined,
            _count: undefined,
          };
        })
        .filter(Boolean); // Remove null entries (flights that didn't meet duration criteria)

      // Calculate total pages
      const totalPages = Math.ceil(filteredCount / limit);

      return {
        data: processedFlights,
        metadata: {
          totalCount: await prisma.flight.count(),
          filteredCount: processedFlights.length,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      };
    } catch (error) {
      logger.error(`Error in customFlightQuery: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to execute custom flight query", 500);
    }
  }
}

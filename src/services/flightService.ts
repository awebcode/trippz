import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";
import { logger } from "../utils/logger";
import type {
  CreateFlightInput,
  UpdateFlightInput,
  SearchFlightsInput,
} from "../validators/flightValidators";

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

  static async getFlights() {
    try {
      const flights = await prisma.flight.findMany({
        include: {
          images: true,
        },
      });

      return flights;
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
                  full_name: true,
                  last_name: true,
                  profile_picture: true,
                },
              },
            },
          },
        },
      });

      if (!flight) {
        throw new AppError("Flight not found", 404);
      }

      return flight;
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
          flight_number: data.flight_number ?? flight.flight_number,
          airline: data.airline ?? flight.airline,
          departure_time: data.departure_time
            ? new Date(data.departure_time)
            : flight.departure_time,
          arrival_time: data.arrival_time
            ? new Date(data.arrival_time)
            : flight.arrival_time,
          from_airport: data.from_airport ?? flight.from_airport,
          to_airport: data.to_airport ?? flight.to_airport,
          price: data.price ?? flight.price,
          seat_class: data.seat_class ?? flight.seat_class,
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

  static async searchFlights(params: SearchFlightsInput) {
    try {
      const where: any = {};

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

      if (params.departure_date) {
        const departureDate = new Date(params.departure_date);
        const nextDay = new Date(departureDate);
        nextDay.setDate(nextDay.getDate() + 1);

        where.departure_time = {
          gte: departureDate,
          lt: nextDay,
        };
      }

      if (params.seat_class) {
        where.seat_class = {
          equals: params.seat_class,
          mode: "insensitive",
        };
      }

      if (params.min_price || params.max_price) {
        where.price = {};
        if (params.min_price) {
          where.price.gte = params.min_price;
        }
        if (params.max_price) {
          where.price.lte = params.max_price;
        }
      }

      if (params.airline) {
        where.airline = {
          contains: params.airline,
          mode: "insensitive",
        };
      }

      const flights = await prisma.flight.findMany({
        where,
        include: {
          images: true,
        },
      });

      return flights;
    } catch (error) {
      logger.error(`Error in searchFlights: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to search flights", 500);
    }
  }
}

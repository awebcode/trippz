import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";
import { logger } from "../utils/logger";
import type {
  CreateTripInput,
  UpdateTripInput,
  SearchTripsInput,
} from "../validators/tripValidators";

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
      });

      return trip;
    } catch (error) {
      logger.error(`Error in createTrip: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to create trip", 500);
    }
  }

  static async getTrips() {
    try {
      const trips = await prisma.trip.findMany({
        include: {
          images: true,
          user: {
            select: {
              id: true,
              full_name: true,
              last_name: true,
              profile_picture: true,
            },
          },
        },
      });

      return trips;
    } catch (error) {
      logger.error(`Error in getTrips: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to get trips", 500);
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
              full_name: true,
              last_name: true,
              profile_picture: true,
            },
          },
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

      if (!trip) {
        throw new AppError("Trip not found", 404);
      }

      return trip;
    } catch (error) {
      logger.error(`Error in getTripById: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to get trip", 500);
    }
  }

  static async updateTrip(userId: string, id: string, data: UpdateTripInput) {
    try {
      const trip = await prisma.trip.findUnique({
        where: { id },
      });

      if (!trip) {
        throw new AppError("Trip not found", 404);
      }

      if (trip.user_id !== userId) {
        throw new AppError("You are not authorized to update this trip", 403);
      }

      const updatedTrip = await prisma.trip.update({
        where: { id },
        data: {
          trip_name: data.trip_name ?? trip.trip_name,
          description: data.description ?? trip.description,
          start_date: data.start_date ? new Date(data.start_date) : trip.start_date,
          end_date: data.end_date ? new Date(data.end_date) : trip.end_date,
          trip_type: data.trip_type ?? trip.trip_type,
          price: data.price ?? trip.price,
        },
      });

      return updatedTrip;
    } catch (error) {
      logger.error(`Error in updateTrip: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to update trip", 500);
    }
  }

  static async deleteTrip(userId: string, id: string) {
    try {
      const trip = await prisma.trip.findUnique({
        where: { id },
      });

      if (!trip) {
        throw new AppError("Trip not found", 404);
      }

      if (trip.user_id !== userId) {
        throw new AppError("You are not authorized to delete this trip", 403);
      }

      await prisma.trip.delete({
        where: { id },
      });

      return { message: "Trip deleted successfully" };
    } catch (error) {
      logger.error(`Error in deleteTrip: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to delete trip", 500);
    }
  }

  static async searchTrips(params: SearchTripsInput) {
    try {
      const where: any = {};

      if (params.trip_type) {
        where.trip_type = params.trip_type;
      }

      if (params.start_date) {
        where.start_date = {
          gte: new Date(params.start_date),
        };
      }

      if (params.end_date) {
        where.end_date = {
          lte: new Date(params.end_date),
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

      const trips = await prisma.trip.findMany({
        where,
        include: {
          images: true,
          user: {
            select: {
              id: true,
              full_name: true,
              last_name: true,
              profile_picture: true,
            },
          },
        },
      });

      return trips;
    } catch (error) {
      logger.error(`Error in searchTrips: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to search trips", 500);
    }
  }
}

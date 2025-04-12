import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";
import { logger } from "../utils/logger";
import type {
  CreateHotelInput,
  UpdateHotelInput,
  SearchHotelsInput,
} from "../validators/hotelValidators";

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

  static async getHotels() {
    try {
      const hotels = await prisma.hotel.findMany({
        include: {
          images: true,
        },
      });

      return hotels;
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
                  full_name: true,
                  last_name: true,
                  profile_picture: true,
                },
              },
            },
          },
        },
      });

      if (!hotel) {
        throw new AppError("Hotel not found", 404);
      }

      return hotel;
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
          name: data.name ?? hotel.name,
          address: data.address ?? hotel.address,
          rating: data.rating ?? hotel.rating,
          price_per_night: data.price_per_night ?? hotel.price_per_night,
          amenities: data.amenities ?? hotel.amenities,
          available_rooms: data.available_rooms ?? hotel.available_rooms,
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

  static async searchHotels(params: SearchHotelsInput) {
    try {
      const where: any = {};

      if (params.location) {
        where.address = {
          contains: params.location,
          mode: "insensitive",
        };
      }

      if (params.min_price || params.max_price) {
        where.price_per_night = {};
        if (params.min_price) {
          where.price_per_night.gte = params.min_price;
        }
        if (params.max_price) {
          where.price_per_night.lte = params.max_price;
        }
      }

      if (params.rating) {
        where.rating = {
          gte: params.rating,
        };
      }

      if (params.amenities && params.amenities.length > 0) {
        where.amenities = {
          hasSome: params.amenities,
        };
      }

      const hotels = await prisma.hotel.findMany({
        where,
        include: {
          images: true,
        },
      });

      return hotels;
    } catch (error) {
      logger.error(`Error in searchHotels: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to search hotels", 500);
    }
  }
}

import { prisma } from "../lib/prisma";
import { AppError } from "../utils/appError";
import { logger } from "../utils/logger";
import type { DestinationInput } from "../validators/destinationValidators";
import { uploadToCloudinary } from "../utils/fileUpload";

export class DestinationService {
  static async createDestination(data: DestinationInput, files?: Express.Multer.File[]) {
    try {
      const destination = await prisma.destination.create({
        data: {
          name: data.name,
          country: data.country,
          city: data.city,
          description: data.description,
          highlights: data.highlights,
          best_time_to_visit: data.best_time_to_visit,
          travel_tips: data.travel_tips,
          latitude: data.latitude,
          longitude: data.longitude,
          currency: data.currency,
          language: data.language,
          timezone: data.timezone,
          safety_index: data.safety_index,
          cost_index: data.cost_index,
          featured: data.featured || false,
          meta_title: data.meta_title || data.name,
          meta_description: data.meta_description || data.description.substring(0, 160),
        },
      });

      // Upload images if provided
      if (files && files.length > 0) {
        await Promise.all(
          files.map(async (file, index) => {
            const uploadResult = await uploadToCloudinary(
              file.path,
              "trippz/destinations"
            );
            await prisma.image.create({
              data: {
                destination_id: destination.id,
                file_url: uploadResult.url,
                file_type: file.mimetype,
                is_featured: index === 0, // First image is featured by default
                alt_text: `${destination.name} - ${index + 1}`,
              },
            });
          })
        );
      }

      return destination;
    } catch (error) {
      logger.error(`Error in createDestination: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to create destination", 500);
    }
  }

  static async getDestinations(query: any = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        country,
        featured,
        sortBy = "name",
        sortOrder = "asc",
      } = query;

      const skip = (page - 1) * limit;

      // Build where conditions
      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { country: { contains: search, mode: "insensitive" } },
          { city: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      if (country) {
        where.country = { contains: country, mode: "insensitive" };
      }

      if (featured !== undefined) {
        where.featured = featured === "true";
      }

      // Get total count
      const totalCount = await prisma.destination.count({ where });

      // Get destinations with pagination
      const destinations = await prisma.destination.findMany({
        where,
        include: {
          images: {
            orderBy: { created_at: "asc" },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: Number.parseInt(limit.toString()),
      });

      // Calculate total pages
      const totalPages = Math.ceil(totalCount / Number.parseInt(limit.toString()));

      return {
        metadata: {
          totalCount,
          filteredCount: destinations.length,
          totalPages,
          currentPage: Number.parseInt(page.toString()),
          limit: Number.parseInt(limit.toString()),
          hasNextPage: Number.parseInt(page.toString()) < totalPages,
          hasPreviousPage: Number.parseInt(page.toString()) > 1,
        },
        data: destinations,
      };
    } catch (error) {
      logger.error(`Error in getDestinations: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to get destinations", 500);
    }
  }

  static async getDestinationById(id: string) {
    try {
      const destination = await prisma.destination.findUnique({
        where: { id },
        include: {
          images: {
            orderBy: { created_at: "asc" },
          },
          packages: {
            include: {
              agency: true,
              images: {
                orderBy: { created_at: "asc" },
                take: 1,
              },
            },
            take: 5,
          },
        },
      });

      if (!destination) {
        throw new AppError("Destination not found", 404);
      }

      return destination;
    } catch (error) {
      logger.error(`Error in getDestinationById: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to get destination", 500);
    }
  }

  static async updateDestination(
    id: string,
    data: DestinationInput,
    files?: Express.Multer.File[]
  ) {
    try {
      const destination = await prisma.destination.findUnique({
        where: { id },
      });

      if (!destination) {
        throw new AppError("Destination not found", 404);
      }

      const updatedDestination = await prisma.destination.update({
        where: { id },
        data: {
          name: data.name,
          country: data.country,
          city: data.city,
          description: data.description,
          highlights: data.highlights,
          best_time_to_visit: data.best_time_to_visit,
          travel_tips: data.travel_tips,
          latitude: data.latitude,
          longitude: data.longitude,
          currency: data.currency,
          language: data.language,
          timezone: data.timezone,
          safety_index: data.safety_index,
          cost_index: data.cost_index,
          featured: data.featured,
          meta_title: data.meta_title,
          meta_description: data.meta_description,
        },
      });

      // Upload images if provided
      if (files && files.length > 0) {
        await Promise.all(
          files.map(async (file, index) => {
            const uploadResult = await uploadToCloudinary(
              file.path,
              "trippz/destinations"
            );
            await prisma.image.create({
              data: {
                destination_id: id,
                file_url: uploadResult.url,
                file_type: file.mimetype,
                alt_text: `${updatedDestination.name} - ${index + 1}`,
              },
            });
          })
        );
      }

      return updatedDestination;
    } catch (error) {
      logger.error(`Error in updateDestination: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to update destination", 500);
    }
  }

  static async deleteDestination(id: string) {
    try {
      const destination = await prisma.destination.findUnique({
        where: { id },
        include: {
          packages: true,
        },
      });

      if (!destination) {
        throw new AppError("Destination not found", 404);
      }

      // Check if destination is used in any packages
      if (destination.packages.length > 0) {
        throw new AppError(
          "Cannot delete destination that is used in travel packages",
          400
        );
      }

      // Delete destination images
      await prisma.image.deleteMany({
        where: { destination_id: id },
      });

      // Delete destination
      await prisma.destination.delete({
        where: { id },
      });

      return { message: "Destination deleted successfully" };
    } catch (error) {
      logger.error(`Error in deleteDestination: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to delete destination", 500);
    }
  }

  static async setFeaturedImage(id: string, imageId: string) {
    try {
      const destination = await prisma.destination.findUnique({
        where: { id },
        include: {
          images: true,
        },
      });

      if (!destination) {
        throw new AppError("Destination not found", 404);
      }

      const image = destination.images.find((img) => img.id === imageId);

      if (!image) {
        throw new AppError("Image not found for this destination", 404);
      }

      // Reset all images to not featured
      await prisma.image.updateMany({
        where: { destination_id: id },
        data: { is_featured: false },
      });

      // Set the selected image as featured
      await prisma.image.update({
        where: { id: imageId },
        data: { is_featured: true },
      });

      return { success: true, message: "Featured image updated successfully" };
    } catch (error) {
      logger.error(`Error in setFeaturedImage: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to set featured image", 500);
    }
  }

  static async getTrendingDestinations(limit = 5) {
    try {
      // Get destinations with the most bookings in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const trendingDestinations = await prisma.$queryRaw`
        SELECT d.*, COUNT(b.id) as booking_count
        FROM "Destination" d
        JOIN "TravelPackage" tp ON tp."id" = ANY(d."package_ids")
        JOIN "Booking" b ON b."trip_id" = tp."id"
        WHERE b."created_at" > ${thirtyDaysAgo}
        GROUP BY d."id"
        ORDER BY booking_count DESC
        LIMIT ${limit}
      `;

      return trendingDestinations;
    } catch (error) {
      logger.error(`Error in getTrendingDestinations: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to get trending destinations", 500);
    }
  }

  static async getNearbyDestinations(
    latitude: number,
    longitude: number,
    radiusKm = 100,
    limit = 5
  ) {
    try {
      // Calculate nearby destinations using Haversine formula
      const nearbyDestinations = await prisma.$queryRaw`
        SELECT *, 
          (6371 * acos(cos(radians(${latitude})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${longitude})) + sin(radians(${latitude})) * sin(radians(latitude)))) AS distance
        FROM "Destination"
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        HAVING distance < ${radiusKm}
        ORDER BY distance
        LIMIT ${limit}
      `;

      return nearbyDestinations;
    } catch (error) {
      logger.error(`Error in getNearbyDestinations: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to get nearby destinations", 500);
    }
  }

  static async getDestinationWeather(id: string) {
    try {
      const destination = await prisma.destination.findUnique({
        where: { id },
        select: { latitude: true, longitude: true, name: true },
      });

      if (!destination) {
        throw new AppError("Destination not found", 404);
      }

      if (!destination.latitude || !destination.longitude) {
        throw new AppError("Destination coordinates not available", 400);
      }

      // In a real implementation, you would call a weather API here
      // This is a simplified version for demonstration purposes
      const weather = {
        destination: destination.name,
        current: {
          temperature: 22,
          condition: "Sunny",
          humidity: 65,
          wind_speed: 10,
          icon: "sun",
        },
        forecast: [
          { date: "2023-06-01", high: 24, low: 18, condition: "Sunny" },
          { date: "2023-06-02", high: 25, low: 19, condition: "Partly Cloudy" },
          { date: "2023-06-03", high: 23, low: 17, condition: "Cloudy" },
          { date: "2023-06-04", high: 22, low: 16, condition: "Light Rain" },
          { date: "2023-06-05", high: 21, low: 15, condition: "Showers" },
        ],
      };

      return weather;
    } catch (error) {
      logger.error(`Error in getDestinationWeather: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to get destination weather", 500);
    }
  }

  static async getDestinationAttractions(id: string, limit = 10) {
    try {
      const destination = await prisma.destination.findUnique({
        where: { id },
      });

      if (!destination) {
        throw new AppError("Destination not found", 404);
      }

      // In a real implementation, you would query a database or external API
      // This is a simplified version for demonstration purposes
      const attractions = [
        {
          name: `Top Museum in ${destination.name}`,
          type: "Museum",
          rating: 4.7,
          description: "A world-class museum featuring local history and art.",
          address: "123 Museum Street",
          image_url: "https://example.com/museum.jpg",
          website: "https://museum.example.com",
        },
        {
          name: `${destination.name} National Park`,
          type: "Park",
          rating: 4.9,
          description: "Beautiful natural landscapes and hiking trails.",
          address: "456 Park Avenue",
          image_url: "https://example.com/park.jpg",
          website: "https://park.example.com",
        },
        {
          name: `Historic ${destination.name} Tower`,
          type: "Monument",
          rating: 4.5,
          description: "An iconic landmark with panoramic views.",
          address: "789 Tower Road",
          image_url: "https://example.com/tower.jpg",
          website: "https://tower.example.com",
        },
      ];

      return attractions.slice(0, limit);
    } catch (error) {
      logger.error(`Error in getDestinationAttractions: ${error}`);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to get destination attractions", 500);
    }
  }
}

import { prisma } from "../lib/prisma"
import { AppError } from "../utils/appError"
import { logger } from "../utils/logger"
import type { DestinationInput } from "../validators/destinationValidators"
import { uploadToCloudinary } from "../utils/fileUpload"
import type { Express } from "express"
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
        },
      })

      // Upload images if provided
      if (files && files.length > 0) {
        await Promise.all(
          files.map(async (file) => {
            const uploadResult = await uploadToCloudinary(file.path, "trippz/destinations")
            await prisma.image.create({
              data: {
                destination_id: destination.id,
                file_url: uploadResult.url,
                file_type: file.mimetype,
              },
            })
          }),
        )
      }

      return destination
    } catch (error) {
      logger.error(`Error in createDestination: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to create destination", 500)
    }
  }

  static async getDestinations() {
    try {
      const destinations = await prisma.destination.findMany({
        include: {
          images: true,
        },
      })

      return destinations
    } catch (error) {
      logger.error(`Error in getDestinations: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to get destinations", 500)
    }
  }

  static async getDestinationById(id: string) {
    try {
      const destination = await prisma.destination.findUnique({
        where: { id },
        include: {
          images: true,
          packages: {
            include: {
              agency: true,
              images: true,
            },
          },
        },
      })

      if (!destination) {
        throw new AppError("Destination not found", 404)
      }

      return destination
    } catch (error) {
      logger.error(`Error in getDestinationById: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to get destination", 500)
    }
  }

  static async updateDestination(id: string, data: DestinationInput, files?: Express.Multer.File[]) {
    try {
      const destination = await prisma.destination.findUnique({
        where: { id },
      })

      if (!destination) {
        throw new AppError("Destination not found", 404)
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
        },
      })

      // Upload images if provided
      if (files && files.length > 0) {
        await Promise.all(
          files.map(async (file) => {
            const uploadResult = await uploadToCloudinary(file.path, "trippz/destinations")
            await prisma.image.create({
              data: {
                destination_id: id,
                file_url: uploadResult.url,
                file_type: file.mimetype,
              },
            })
          }),
        )
      }

      return updatedDestination
    } catch (error) {
      logger.error(`Error in updateDestination: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to update destination", 500)
    }
  }

  static async deleteDestination(id: string) {
    try {
      const destination = await prisma.destination.findUnique({
        where: { id },
        include: {
          packages: true,
        },
      })

      if (!destination) {
        throw new AppError("Destination not found", 404)
      }

      // Check if destination is used in any packages
      if (destination.packages.length > 0) {
        throw new AppError("Cannot delete destination that is used in travel packages", 400)
      }

      // Delete destination images
      await prisma.image.deleteMany({
        where: { destination_id: id },
      })

      // Delete destination
      await prisma.destination.delete({
        where: { id },
      })

      return { message: "Destination deleted successfully" }
    } catch (error) {
      logger.error(`Error in deleteDestination: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to delete destination", 500)
    }
  }
}

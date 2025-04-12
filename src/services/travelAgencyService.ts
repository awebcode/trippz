import { prisma } from "../lib/prisma"
import { AppError } from "../utils/appError"
import { logger } from "../utils/logger"
import type { TravelAgencyProfileInput, TravelPackageInput } from "../validators/travelAgencyValidators"
import { uploadToCloudinary } from "../utils/fileUpload"
import type { Express } from "express"

export class TravelAgencyService {
  static async register(userId: string, data: TravelAgencyProfileInput) {
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new AppError("User not found", 404)
      }

      // Check if user is already a travel agency
      const existingAgency = await prisma.travelAgency.findUnique({
        where: { user_id: userId },
      })

      if (existingAgency) {
        throw new AppError("User is already registered as a travel agency", 400)
      }

      // Create travel agency profile
      const travelAgency = await prisma.travelAgency.create({
        data: {
          user_id: userId,
          agency_name: data.agency_name,
          agency_address: data.agency_address,
          agency_phone: data.agency_phone,
          agency_email: data.agency_email,
          website: data.website,
          description: data.description,
        },
      })

      // Update user role
      await prisma.user.update({
        where: { id: userId },
        data: { role: "TRAVEL_AGENCY" },
      })

      return travelAgency
    } catch (error) {
      logger.error(`Error in registerTravelAgency: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to register as travel agency", 500)
    }
  }

  static async getProfile(userId: string) {
    try {
      const travelAgency = await prisma.travelAgency.findFirst({
        where: { user_id: userId },
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              phone_number: true,
              profile_picture: true,
            },
          },
        },
      })

      if (!travelAgency) {
        throw new AppError("Travel agency profile not found", 404)
      }

      return travelAgency
    } catch (error) {
      logger.error(`Error in getTravelAgencyProfile: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to get travel agency profile", 500)
    }
  }

  static async updateProfile(userId: string, data: TravelAgencyProfileInput) {
    try {
      const travelAgency = await prisma.travelAgency.findFirst({
        where: { user_id: userId },
      })

      if (!travelAgency) {
        throw new AppError("Travel agency profile not found", 404)
      }

      const updatedProfile = await prisma.travelAgency.update({
        where: { id: travelAgency.id },
        data: {
          agency_name: data.agency_name,
          agency_address: data.agency_address,
          agency_phone: data.agency_phone,
          agency_email: data.agency_email,
          website: data.website,
          description: data.description,
        },
      })

      return updatedProfile
    } catch (error) {
      logger.error(`Error in updateTravelAgencyProfile: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to update travel agency profile", 500)
    }
  }

  static async createPackage(userId: string, data: TravelPackageInput, files?: Express.Multer.File[]) {
    try {
      const travelAgency = await prisma.travelAgency.findFirst({
        where: { user_id: userId },
      })

      if (!travelAgency) {
        throw new AppError("Travel agency profile not found", 404)
      }

      // Verify that all destinations exist
      const destinations = await prisma.destination.findMany({
        where: {
          id: {
            in: data.destination_ids,
          },
        },
      })

      if (destinations.length !== data.destination_ids.length) {
        throw new AppError("One or more destinations not found", 404)
      }

      const travelPackage = await prisma.travelPackage.create({
        data: {
          agency_id: travelAgency.id,
          name: data.name,
          description: data.description,
          price: data.price,
          duration: data.duration,
          inclusions: data.inclusions,
          exclusions: data.exclusions,
          itinerary: data.itinerary,
          max_travelers: data.max_travelers,
          destinations: {
            connect: data.destination_ids.map((id) => ({ id })),
          },
        },
      })

      // Upload images if provided
      if (files && files.length > 0) {
        await Promise.all(
          files.map(async (file) => {
            const uploadResult = await uploadToCloudinary(file.path, "trippz/packages")
            await prisma.image.create({
              data: {
                package_id: travelPackage.id,
                file_url: uploadResult.url,
                file_type: file.mimetype,
              },
            })
          }),
        )
      }

      return travelPackage
    } catch (error) {
      logger.error(`Error in createPackage: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to create travel package", 500)
    }
  }

  static async getPackages(agencyId: string) {
    try {
      const travelAgency = await prisma.travelAgency.findFirst({
        where: { user_id: agencyId },
      })

      if (!travelAgency) {
        throw new AppError("Travel agency profile not found", 404)
      }

      const packages = await prisma.travelPackage.findMany({
        where: { agency_id: travelAgency.id },
        include: {
          images: true,
          destinations: true,
        },
      })

      return packages
    } catch (error) {
      logger.error(`Error in getPackages: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to get travel packages", 500)
    }
  }

  static async getPackageById(packageId: string) {
    try {
      const travelPackage = await prisma.travelPackage.findUnique({
        where: { id: packageId },
        include: {
          images: true,
          destinations: true,
          agency: {
            include: {
              user: {
                select: {
                  id: true,
                  first_name: true,
                  last_name: true,
                  email: true,
                  profile_picture: true,
                },
              },
            },
          },
        },
      })

      if (!travelPackage) {
        throw new AppError("Travel package not found", 404)
      }

      return travelPackage
    } catch (error) {
      logger.error(`Error in getPackageById: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to get travel package", 500)
    }
  }

  static async updatePackage(
    userId: string,
    packageId: string,
    data: TravelPackageInput,
    files?: Express.Multer.File[],
  ) {
    try {
      const travelAgency = await prisma.travelAgency.findFirst({
        where: { user_id: userId },
      })

      if (!travelAgency) {
        throw new AppError("Travel agency profile not found", 404)
      }

      const travelPackage = await prisma.travelPackage.findUnique({
        where: { id: packageId },
      })

      if (!travelPackage) {
        throw new AppError("Travel package not found", 404)
      }

      if (travelPackage.agency_id !== travelAgency.id) {
        throw new AppError("You are not authorized to update this package", 403)
      }

      // Verify that all destinations exist
      const destinations = await prisma.destination.findMany({
        where: {
          id: {
            in: data.destination_ids,
          },
        },
      })

      if (destinations.length !== data.destination_ids.length) {
        throw new AppError("One or more destinations not found", 404)
      }

      // Update package
      const updatedPackage = await prisma.travelPackage.update({
        where: { id: packageId },
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          duration: data.duration,
          inclusions: data.inclusions,
          exclusions: data.exclusions,
          itinerary: data.itinerary,
          max_travelers: data.max_travelers,
          destinations: {
            set: data.destination_ids.map((id) => ({ id })),
          },
        },
      })

      // Upload images if provided
      if (files && files.length > 0) {
        await Promise.all(
          files.map(async (file) => {
            const uploadResult = await uploadToCloudinary(file.path, "trippz/packages")
            await prisma.image.create({
              data: {
                package_id: packageId,
                file_url: uploadResult.url,
                file_type: file.mimetype,
              },
            })
          }),
        )
      }

      return updatedPackage
    } catch (error) {
      logger.error(`Error in updatePackage: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to update travel package", 500)
    }
  }

  static async deletePackage(userId: string, packageId: string) {
    try {
      const travelAgency = await prisma.travelAgency.findFirst({
        where: { user_id: userId },
      })

      if (!travelAgency) {
        throw new AppError("Travel agency profile not found", 404)
      }

      const travelPackage = await prisma.travelPackage.findUnique({
        where: { id: packageId },
      })

      if (!travelPackage) {
        throw new AppError("Travel package not found", 404)
      }

      if (travelPackage.agency_id !== travelAgency.id) {
        throw new AppError("You are not authorized to delete this package", 403)
      }

      // Delete package images
      await prisma.image.deleteMany({
        where: { package_id: packageId },
      })

      // Delete package
      await prisma.travelPackage.delete({
        where: { id: packageId },
      })

      return { message: "Travel package deleted successfully" }
    } catch (error) {
      logger.error(`Error in deletePackage: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to delete travel package", 500)
    }
  }

  static async getOrders(userId: string) {
    try {
      const travelAgency = await prisma.travelAgency.findFirst({
        where: { user_id: userId },
      })

      if (!travelAgency) {
        throw new AppError("Travel agency profile not found", 404)
      }

      const orders = await prisma.packageOrder.findMany({
        where: {
          package: {
            agency_id: travelAgency.id,
          },
        },
        include: {
          package: true,
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              phone_number: true,
            },
          },
        },
      })

      return orders
    } catch (error) {
      logger.error(`Error in getOrders: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to get orders", 500)
    }
  }

  static async respondToOrder(userId: string, orderId: string, response: string) {
    try {
      const travelAgency = await prisma.travelAgency.findFirst({
        where: { user_id: userId },
      })

      if (!travelAgency) {
        throw new AppError("Travel agency profile not found", 404)
      }

      const order = await prisma.packageOrder.findUnique({
        where: { id: orderId },
        include: {
          package: true,
        },
      })

      if (!order) {
        throw new AppError("Order not found", 404)
      }

      if (order.package.agency_id !== travelAgency.id) {
        throw new AppError("You are not authorized to respond to this order", 403)
      }

      const updatedOrder = await prisma.packageOrder.update({
        where: { id: orderId },
        data: {
          agency_response: response,
          status: "CONFIRMED",
        },
      })

      return updatedOrder
    } catch (error) {
      logger.error(`Error in respondToOrder: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to respond to order", 500)
    }
  }
}

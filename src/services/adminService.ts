import type { Role } from "@prisma/client"
import { prisma } from "../lib/prisma"
import { AppError } from "../utils/appError"
import { logger } from "../utils/logger"

export class AdminService {
  static async getUsers() {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          phone_number: true,
          role: true,
          email_verified: true,
          phone_verified: true,
          profile_picture: true,
          created_at: true,
        },
      })

      return users
    } catch (error) {
      logger.error(`Error in getUsers: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to get users", 500)
    }
  }

  static async getUserById(id: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          Profile: true,
          addresses: true,
          serviceProvider: true,
          travelAgency: true,
        },
      })

      if (!user) {
        throw new AppError("User not found", 404)
      }

      return user
    } catch (error) {
      logger.error(`Error in getUserById: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to get user", 500)
    }
  }

  static async updateUserRole(id: string, role: Role) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      })

      if (!user) {
        throw new AppError("User not found", 404)
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: { role },
      })

      return updatedUser
    } catch (error) {
      logger.error(`Error in updateUserRole: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to update user role", 500)
    }
  }

  static async getStats() {
    try {
      const [
        totalUsers,
        totalServiceProviders,
        totalTravelAgencies,
        totalDestinations,
        totalPackages,
        totalServices,
        totalServiceOrders,
        totalPackageOrders,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.serviceProvider.count(),
        prisma.travelAgency.count(),
        prisma.destination.count(),
        prisma.travelPackage.count(),
        prisma.service.count(),
        prisma.serviceOrder.count(),
        prisma.packageOrder.count(),
      ])

      return {
        users: {
          total: totalUsers,
          serviceProviders: totalServiceProviders,
          travelAgencies: totalTravelAgencies,
        },
        content: {
          destinations: totalDestinations,
          packages: totalPackages,
          services: totalServices,
        },
        orders: {
          serviceOrders: totalServiceOrders,
          packageOrders: totalPackageOrders,
          total: totalServiceOrders + totalPackageOrders,
        },
      }
    } catch (error) {
      logger.error(`Error in getStats: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to get stats", 500)
    }
  }

  static async getReports() {
    try {
      // Get monthly user registrations for the past 12 months
      const today = new Date()
      const twelveMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 11, 1)

      const userRegistrations = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          COUNT(*) as count
        FROM "User"
        WHERE created_at >= ${twelveMonthsAgo}
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month ASC
      `

      // Get orders by status
      const serviceOrdersByStatus = await prisma.serviceOrder.groupBy({
        by: ["status"],
        _count: {
          id: true,
        },
      })

      const packageOrdersByStatus = await prisma.packageOrder.groupBy({
        by: ["status"],
        _count: {
          id: true,
        },
      })

      // Get top destinations
      const topDestinations = await prisma.destination.findMany({
        take: 10,
        include: {
          packages: {
            include: {
              PackageOrder: true,
            },
          },
        },
        orderBy: {
          packages: {
            _count: "desc",
          },
        },
      })

      return {
        userRegistrations,
        orders: {
          serviceOrdersByStatus,
          packageOrdersByStatus,
        },
        topDestinations: topDestinations.map((dest) => ({
          id: dest.id,
          name: dest.name,
          country: dest.country,
          packageCount: dest.packages.length,
          orderCount: dest.packages.reduce((acc, pkg) => acc + pkg.PackageOrder.length, 0),
        })),
      }
    } catch (error) {
      logger.error(`Error in getReports: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to get reports", 500)
    }
  }
}

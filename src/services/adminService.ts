import type { Role, User, Prisma } from "@prisma/client"
import { prisma } from "../lib/prisma"
import { AppError } from "../utils/appError"
import { logger } from "../utils/logger"
import type { PaginatedResult } from "../validators/commonValidators"
import type { AnalyticsQuery, SystemSettingsInput, UserQuery } from "../validators/adminValidators"

export class AdminService {
  // User Management
  static async getUsers(query: UserQuery): Promise<PaginatedResult<User>> {
    try {
      const { page, limit, sortBy, sortOrder, search, role, emailVerified, phoneVerified } = query
     console.log({ page, limit, sortBy, sortOrder, search, role, emailVerified, phoneVerified })
      // Calculate pagination
      const skip = (page - 1) * limit

      // Build where conditions
      const where: Prisma.UserWhereInput = {}

      // Add search condition
      if (search) {
        where.OR = [
          { first_name: { contains: search, mode: "insensitive" } },
          { last_name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone_number: { contains: search, mode: "insensitive" } },
        ]
      }

      // Add role filter
      if (role) {
        where.role = role
      }

      // Add verification filters
      if (emailVerified !== undefined) {
        where.email_verified = emailVerified
      }

      if (phoneVerified !== undefined) {
        where.phone_verified = phoneVerified
      }

      // Execute count query for total records
      const totalCount = await prisma.user.count()

      // Execute count query with filters
      const filteredCount = await prisma.user.count({ where })

      // Execute main query with pagination, sorting, and filtering
      const users = await prisma.user.findMany({
        where,
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
          updated_at: true,
        },
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      })

      // Calculate pagination metadata
      const totalPages = Math.ceil(filteredCount / limit)

      return {
        data: users as User[],
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
          bookings: {
            take: 5,
            orderBy: { created_at: "desc" },
          },
          reviews: {
            take: 5,
            orderBy: { created_at: "desc" },
          },
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

  static async deleteUser(id: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
      })

      if (!user) {
        throw new AppError("User not found", 404)
      }

      // Delete user and all related data
      await prisma.$transaction(async (tx) => {
        // Delete addresses
        await tx.address.deleteMany({
          where: { user_id: id },
        })

        // Delete profile
        await tx.profile.deleteMany({
          where: { user_id: id },
        })

        // Delete service provider
        await tx.serviceProvider.deleteMany({
          where: { user_id: id },
        })

        // Delete travel agency
        await tx.travelAgency.deleteMany({
          where: { user_id: id },
        })

        // Delete reviews
        await tx.review.deleteMany({
          where: { user_id: id },
        })

        // Delete bookings
        await tx.booking.deleteMany({
          where: { user_id: id },
        })

        // Finally delete the user
        await tx.user.delete({
          where: { id },
        })
      })

      return { success: true, message: "User deleted successfully" }
    } catch (error) {
      logger.error(`Error in deleteUser: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to delete user", 500)
    }
  }

  // Dashboard Analytics
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
        totalBookings,
        totalRevenue,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.serviceProvider.count(),
        prisma.travelAgency.count(),
        prisma.destination.count(),
        prisma.travelPackage.count(),
        prisma.service.count(),
        prisma.serviceOrder.count(),
        prisma.packageOrder.count(),
        prisma.booking.count(),
        prisma.payment.aggregate({
          _sum: {
            amount_paid: true,
          },
          where: {
            payment_status: "SUCCESS",
          },
        }),
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
          bookings: totalBookings,
          total: totalServiceOrders + totalPackageOrders + totalBookings,
        },
        revenue: {
          total: totalRevenue._sum.amount_paid || 0,
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

  static async getAnalytics(query: AnalyticsQuery) {
    try {
      const { period, startDate, endDate } = query

      // Define date ranges based on period
      let dateFrom = new Date()
      const dateTo = new Date()

      if (startDate && endDate) {
        dateFrom = new Date(startDate)
        dateTo.setTime(new Date(endDate).getTime())
      } else {
        switch (period) {
          case "daily":
            dateFrom.setDate(dateFrom.getDate() - 30) // Last 30 days
            break
          case "weekly":
            dateFrom.setDate(dateFrom.getDate() - 90) // Last 90 days
            break
          case "monthly":
            dateFrom.setMonth(dateFrom.getMonth() - 12) // Last 12 months
            break
          case "yearly":
            dateFrom.setFullYear(dateFrom.getFullYear() - 5) // Last 5 years
            break
        }
      }

      // Format for SQL query
      const formattedDateFrom = dateFrom.toISOString()
      const formattedDateTo = dateTo.toISOString()

      // Get user registrations over time
      const userRegistrations = await this.getUserRegistrationsByPeriod(period, formattedDateFrom, formattedDateTo)

      // Get bookings over time
      const bookings = await this.getBookingsByPeriod(period, formattedDateFrom, formattedDateTo)

      // Get revenue over time
      const revenue = await this.getRevenueByPeriod(period, formattedDateFrom, formattedDateTo)

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

      const bookingsByStatus = await prisma.booking.groupBy({
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

      // Get top services
      const topServices = await prisma.service.findMany({
        take: 10,
        include: {
          ServiceOrder: true,
        },
        orderBy: {
          ServiceOrder: {
            _count: "desc",
          },
        },
      })

      return {
        userRegistrations,
        bookings,
        revenue,
        orders: {
          serviceOrdersByStatus,
          packageOrdersByStatus,
          bookingsByStatus,
        },
        topDestinations: topDestinations.map((dest) => ({
          id: dest.id,
          name: dest.name,
          country: dest.country,
          packageCount: dest.packages.length,
          orderCount: dest.packages.reduce((acc, pkg) => acc + pkg.PackageOrder.length, 0),
        })),
        topServices: topServices.map((service) => ({
          id: service.id,
          name: service.name,
          provider_id: service.provider_id,
          orderCount: service.ServiceOrder.length,
          revenue: service.ServiceOrder.reduce((acc, order) => acc + (order.total_price || 0), 0),
        })),
      }
    } catch (error) {
      logger.error(`Error in getAnalytics: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to get analytics", 500)
    }
  }

  // System Settings
  static async getSystemSettings() {
    try {
      const settings = await prisma.systemSetting.findFirst()

      if (!settings) {
        // Create default settings if none exist
        return await prisma.systemSetting.create({
          data: {
            maintenance_mode: false,
            booking_fee_percentage: 5,
            default_currency: "USD",
            support_email: "support@trippz.com",
            support_phone: "+1234567890",
            terms_url: "https://trippz.com/terms",
            privacy_url: "https://trippz.com/privacy",
          },
        })
      }

      return settings
    } catch (error) {
      logger.error(`Error in getSystemSettings: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to get system settings", 500)
    }
  }

  static async updateSystemSettings(data: SystemSettingsInput) {
    try {
      const settings = await prisma.systemSetting.findFirst()

      if (!settings) {
        return await prisma.systemSetting.create({
          data,
        })
      }

      return await prisma.systemSetting.update({
        where: { id: settings.id },
        data,
      })
    } catch (error) {
      logger.error(`Error in updateSystemSettings: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to update system settings", 500)
    }
  }

  // Content Management
  static async getAllDestinations(query: any) {
    try {
      const { page, limit, sortBy, sortOrder, search } = query

      // Calculate pagination
      const skip = (page - 1) * limit

      // Build where conditions
      const where: Prisma.DestinationWhereInput = {}

      // Add search condition
      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { country: { contains: search, mode: "insensitive" } },
          { city: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ]
      }

      // Execute count query for total records
      const totalCount = await prisma.destination.count()

      // Execute count query with filters
      const filteredCount = await prisma.destination.count({ where })

      // Execute main query with pagination, sorting, and filtering
      const destinations = await prisma.destination.findMany({
        where,
        include: {
          images: true,
          packages: {
            select: {
              id: true,
              name: true,
              _count: {
                select: {
                  PackageOrder: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      })

      // Calculate pagination metadata
      const totalPages = Math.ceil(filteredCount / limit)

      return {
        data: destinations,
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
      logger.error(`Error in getAllDestinations: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to get destinations", 500)
    }
  }

  // Helper methods for analytics
  private static async getUserRegistrationsByPeriod(period: string, dateFrom: string, dateTo: string) {
    let dateFormat: string
    let groupBy: string

    switch (period) {
      case "daily":
        dateFormat = "YYYY-MM-DD"
        groupBy = "day"
        break
      case "weekly":
        dateFormat = "YYYY-WW"
        groupBy = "week"
        break
      case "monthly":
        dateFormat = "YYYY-MM"
        groupBy = "month"
        break
      case "yearly":
        dateFormat = "YYYY"
        groupBy = "year"
        break
      default:
        dateFormat = "YYYY-MM"
        groupBy = "month"
    }

    const registrations = await prisma.$queryRaw`
      SELECT 
        TO_CHAR(created_at, ${dateFormat}) as period,
        COUNT(*) as count
      FROM "User"
      WHERE created_at BETWEEN ${dateFrom}::timestamp AND ${dateTo}::timestamp
      GROUP BY TO_CHAR(created_at, ${dateFormat})
      ORDER BY period ASC
    `

    return registrations
  }

  private static async getBookingsByPeriod(period: string, dateFrom: string, dateTo: string) {
    let dateFormat: string
    let groupBy: string

    switch (period) {
      case "daily":
        dateFormat = "YYYY-MM-DD"
        groupBy = "day"
        break
      case "weekly":
        dateFormat = "YYYY-WW"
        groupBy = "week"
        break
      case "monthly":
        dateFormat = "YYYY-MM"
        groupBy = "month"
        break
      case "yearly":
        dateFormat = "YYYY"
        groupBy = "year"
        break
      default:
        dateFormat = "YYYY-MM"
        groupBy = "month"
    }

    const bookings = await prisma.$queryRaw`
      SELECT 
        TO_CHAR(created_at, ${dateFormat}) as period,
        COUNT(*) as count,
        SUM(total_price) as total_value
      FROM "Booking"
      WHERE created_at BETWEEN ${dateFrom}::timestamp AND ${dateTo}::timestamp
      GROUP BY TO_CHAR(created_at, ${dateFormat})
      ORDER BY period ASC
    `

    return bookings
  }

  private static async getRevenueByPeriod(period: string, dateFrom: string, dateTo: string) {
    let dateFormat: string
    let groupBy: string

    switch (period) {
      case "daily":
        dateFormat = "YYYY-MM-DD"
        groupBy = "day"
        break
      case "weekly":
        dateFormat = "YYYY-WW"
        groupBy = "week"
        break
      case "monthly":
        dateFormat = "YYYY-MM"
        groupBy = "month"
        break
      case "yearly":
        dateFormat = "YYYY"
        groupBy = "year"
        break
      default:
        dateFormat = "YYYY-MM"
        groupBy = "month"
    }

    const revenue = await prisma.$queryRaw`
      SELECT 
        TO_CHAR(payment_date, ${dateFormat}) as period,
        SUM(amount_paid) as revenue
      FROM "Payment"
      WHERE payment_date BETWEEN ${dateFrom}::timestamp AND ${dateTo}::timestamp
      AND payment_status = 'SUCCESS'
      GROUP BY TO_CHAR(payment_date, ${dateFormat})
      ORDER BY period ASC
    `

    return revenue
  }
}

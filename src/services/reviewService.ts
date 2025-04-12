import { prisma } from "../lib/prisma"
import { AppError } from "../utils/appError"
import { logger } from "../utils/logger"
import type { CreateReviewInput, UpdateReviewInput } from "../validators/reviewValidators"

export class ReviewService {
  static async createReview(userId: string, data: CreateReviewInput) {
    try {
      // Validate that the user has a booking for the entity they're reviewing
      if (data.hotel_id) {
        const hasBooking = await prisma.booking.findFirst({
          where: {
            user_id: userId,
            hotel_id: data.hotel_id,
            status: "COMPLETED",
          },
        })

        if (!hasBooking) {
          throw new AppError("You can only review hotels you have stayed at", 400)
        }
      } else if (data.flight_id) {
        const hasBooking = await prisma.booking.findFirst({
          where: {
            user_id: userId,
            flight_id: data.flight_id,
            status: "COMPLETED",
          },
        })

        if (!hasBooking) {
          throw new AppError("You can only review flights you have taken", 400)
        }
      } else if (data.trip_id) {
        const hasBooking = await prisma.booking.findFirst({
          where: {
            user_id: userId,
            trip_id: data.trip_id,
            status: "COMPLETED",
          },
        })

        if (!hasBooking) {
          throw new AppError("You can only review trips you have completed", 400)
        }
      }

      // Create review
      const review = await prisma.review.create({
        data: {
          user_id: userId,
          hotel_id: data.hotel_id,
          flight_id: data.flight_id,
          trip_id: data.trip_id,
          rating: data.rating,
          comment: data.comment,
        },
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
      })

      return review
    } catch (error) {
      logger.error(`Error in createReview: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to create review", 500)
    }
  }

  static async getReviews(entityType: "hotel" | "flight" | "trip", entityId: string) {
    try {
      const where: any = {}
      if (entityType === "hotel") {
        where.hotel_id = entityId
      } else if (entityType === "flight") {
        where.flight_id = entityId
      } else if (entityType === "trip") {
        where.trip_id = entityId
      }

      const reviews = await prisma.review.findMany({
        where,
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
        orderBy: {
          created_at: "desc",
        },
      })

      return reviews
    } catch (error) {
      logger.error(`Error in getReviews: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to get reviews", 500)
    }
  }

  static async getUserReviews(userId: string) {
    try {
      const reviews = await prisma.review.findMany({
        where: { user_id: userId },
        include: {
          hotel: true,
          flight: true,
          trip: true,
        },
      })

      return reviews
    } catch (error) {
      logger.error(`Error in getUserReviews: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to get user reviews", 500)
    }
  }

  static async updateReview(userId: string, reviewId: string, data: UpdateReviewInput) {
    try {
      const review = await prisma.review.findUnique({
        where: { id: reviewId },
      })

      if (!review) {
        throw new AppError("Review not found", 404)
      }

      if (review.user_id !== userId) {
        throw new AppError("You are not authorized to update this review", 403)
      }

      const updatedReview = await prisma.review.update({
        where: { id: reviewId },
        data: {
          rating: data.rating ?? review.rating,
          comment: data.comment ?? review.comment,
        },
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
      })

      return updatedReview
    } catch (error) {
      logger.error(`Error in updateReview: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to update review", 500)
    }
  }

  static async deleteReview(userId: string, reviewId: string) {
    try {
      const review = await prisma.review.findUnique({
        where: { id: reviewId },
      })

      if (!review) {
        throw new AppError("Review not found", 404)
      }

      if (review.user_id !== userId) {
        throw new AppError("You are not authorized to delete this review", 403)
      }

      await prisma.review.delete({
        where: { id: reviewId },
      })

      return { message: "Review deleted successfully" }
    } catch (error) {
      logger.error(`Error in deleteReview: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to delete review", 500)
    }
  }
}

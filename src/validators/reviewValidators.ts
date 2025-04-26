import { z } from "zod"
import { paginationQuerySchema } from "./commonValidators"

export const createReviewSchema = z
  .object({
    hotel_id: z.string().uuid({ message: "Invalid hotel ID format" }).optional(),
    flight_id: z.string().uuid({ message: "Invalid flight ID format" }).optional(),
    trip_id: z.string().uuid({ message: "Invalid trip ID format" }).optional(),
    rating: z
      .number({ required_error: "Rating is required" })
      .min(1, { message: "Rating must be at least 1" })
      .max(5, { message: "Rating cannot exceed 5" }),
    comment: z.string().optional(),
  })
  .strict()
  .refine(
    (data) => {
      return !!(data.hotel_id || data.flight_id || data.trip_id)
    },
    {
      message: "At least one of hotel_id, flight_id, or trip_id is required",
      path: ["hotel_id"],
    },
  )

export const updateReviewSchema = z
  .object({
    rating: z.number().min(1, { message: "Rating must be at least 1" }).max(5, { message: "Rating cannot exceed 5" }),
    comment: z.string(),
  })
  .strict()
  .partial()

export const reviewListQuerySchema = paginationQuerySchema.extend({
  rating: z.number().min(1).max(5).optional(),
  entityType: z.enum(["hotel", "flight", "trip"]).optional(),
})

export type CreateReviewInput = z.infer<typeof createReviewSchema>
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>
export type ReviewListQuery = z.infer<typeof reviewListQuerySchema>

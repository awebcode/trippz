import { z } from "zod"

export const createReviewSchema = z
  .object({
    hotel_id: z.string().uuid().optional(),
    flight_id: z.string().uuid().optional(),
    trip_id: z.string().uuid().optional(),
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
  })
  .strict()
  .refine(
    (data) => {
      return !!(data.hotel_id || data.flight_id || data.trip_id);
    },
    {
      message: "At least one of hotel_id, flight_id, or trip_id is required",
      path: ["hotel_id"],
    }
  );

export const updateReviewSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().optional(),
})

export type CreateReviewInput = z.infer<typeof createReviewSchema>
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>

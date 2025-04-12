import { z } from "zod"

export const createTripSchema = z.object({
  trip_name: z.string().min(3, "Trip name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  start_date: z.string(),
  end_date: z.string(),
  trip_type: z.enum(["ADVENTURE", "MEDICAL", "BUSINESS", "LEISURE"]),
  price: z.number().positive("Price must be positive"),
})

export const updateTripSchema = z.object({
  trip_name: z.string().min(3, "Trip name must be at least 3 characters").optional(),
  description: z.string().min(10, "Description must be at least 10 characters").optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  trip_type: z.enum(["ADVENTURE", "MEDICAL", "BUSINESS", "LEISURE"]).optional(),
  price: z.number().positive("Price must be positive").optional(),
})

export const searchTripsSchema = z.object({
  trip_type: z.enum(["ADVENTURE", "MEDICAL", "BUSINESS", "LEISURE"]).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  min_price: z.number().optional(),
  max_price: z.number().optional(),
})

export type CreateTripInput = z.infer<typeof createTripSchema>
export type UpdateTripInput = z.infer<typeof updateTripSchema>
export type SearchTripsInput = z.infer<typeof searchTripsSchema>

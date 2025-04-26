import { z } from "zod"
import { paginationQuerySchema, priceRangeQuerySchema } from "./commonValidators"

export const createTripSchema = z
  .object({
    trip_name: z
      .string({ required_error: "Trip name is required" })
      .min(3, { message: "Trip name must be at least 3 characters" }),
    description: z
      .string({ required_error: "Description is required" })
      .min(10, { message: "Description must be at least 10 characters" }),
    start_date: z.string({ required_error: "Start date is required" }),
    end_date: z.string({ required_error: "End date is required" }),
    trip_type: z.enum(["ADVENTURE", "MEDICAL", "BUSINESS", "LEISURE"], {
      required_error: "Trip type is required",
      invalid_type_error: "Trip type must be one of: ADVENTURE, MEDICAL, BUSINESS, LEISURE",
    }),
    price: z.number({ required_error: "Price is required" }).positive({ message: "Price must be positive" }),
  })
  .strict()

export const updateTripSchema = z
  .object({
    trip_name: z.string().min(3, { message: "Trip name must be at least 3 characters" }),
    description: z.string().min(10, { message: "Description must be at least 10 characters" }),
    start_date: z.string(),
    end_date: z.string(),
    trip_type: z.enum(["ADVENTURE", "MEDICAL", "BUSINESS", "LEISURE"], {
      invalid_type_error: "Trip type must be one of: ADVENTURE, MEDICAL, BUSINESS, LEISURE",
    }),
    price: z.number().positive({ message: "Price must be positive" }),
  })
  .strict()
  .partial()

export const searchTripsSchema = z
  .object({
    trip_type: z
      .enum(["ADVENTURE", "MEDICAL", "BUSINESS", "LEISURE"], {
        invalid_type_error: "Trip type must be one of: ADVENTURE, MEDICAL, BUSINESS, LEISURE",
      })
      .optional(),
    start_date: z.string().optional(),
    end_date: z.string().optional(),
  })
  .strict()
  .merge(paginationQuerySchema)
  .merge(priceRangeQuerySchema)

export type CreateTripInput = z.infer<typeof createTripSchema>
export type UpdateTripInput = z.infer<typeof updateTripSchema>
export type SearchTripsInput = z.infer<typeof searchTripsSchema>

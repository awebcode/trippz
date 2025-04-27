import { z } from "zod"

export const createTripSchema = z.object({
  trip_name: z.string().min(2, { message: "Trip name is required" }),
  description: z.string().min(10, { message: "Description is required" }),
  start_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Start date must be a valid date",
  }),
  end_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "End date must be a valid date",
  }),
  trip_type: z.enum(["ADVENTURE", "MEDICAL", "BUSINESS", "LEISURE"], {
    invalid_type_error: "Trip type must be one of: ADVENTURE, MEDICAL, BUSINESS, LEISURE",
  }),
  price: z.number().positive({ message: "Price must be a positive number" }),
  destination_ids: z.array(z.string().uuid()).optional(),
  max_participants: z.number().int().positive().optional(),
  itinerary: z.record(z.string()).optional(),
  inclusions: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
  cancellation_policy: z.string().optional(),
  images: z.array(z.string()).optional(),
})

export const updateTripSchema = z.object({
  trip_name: z.string().min(2, { message: "Trip name is required" }).optional(),
  description: z.string().min(10, { message: "Description is required" }).optional(),
  start_date: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Start date must be a valid date",
    })
    .optional(),
  end_date: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "End date must be a valid date",
    })
    .optional(),
  trip_type: z
    .enum(["ADVENTURE", "MEDICAL", "BUSINESS", "LEISURE"], {
      invalid_type_error: "Trip type must be one of: ADVENTURE, MEDICAL, BUSINESS, LEISURE",
    })
    .optional(),
  price: z.number().positive({ message: "Price must be a positive number" }).optional(),
  destination_ids: z.array(z.string().uuid()).optional(),
  max_participants: z.number().int().positive().optional(),
  itinerary: z.record(z.string()).optional(),
  inclusions: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
  cancellation_policy: z.string().optional(),
  images: z.array(z.string()).optional(),
})

export type CreateTripInput = z.infer<typeof createTripSchema>
export type UpdateTripInput = z.infer<typeof updateTripSchema>

import { z } from "zod";

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
});

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
      invalid_type_error:
        "Trip type must be one of: ADVENTURE, MEDICAL, BUSINESS, LEISURE",
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
});

// Enhanced search trips schema with proper validation
export const searchTripsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  search: z.string().optional(),
  sortBy: z
    .enum(["created_at", "start_date", "end_date", "price", "trip_name"])
    .optional()
    .default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  trip_type: z.enum(["ADVENTURE", "MEDICAL", "BUSINESS", "LEISURE"]).optional(),
  destination: z.string().optional(),
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
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  duration_min: z.coerce.number().int().positive().optional(),
  duration_max: z.coerce.number().int().positive().optional(),
  min_rating: z.coerce.number().min(0).max(5).optional(),
  max_participants: z.coerce.number().int().positive().optional(),
  has_availability: z.coerce.boolean().optional(),
  includes_flight: z.coerce.boolean().optional(),
  includes_hotel: z.coerce.boolean().optional(),
  includes_activities: z.coerce.boolean().optional(),
  includes_meals: z.coerce.boolean().optional(),
  is_guided: z.coerce.boolean().optional(),
  is_family_friendly: z.coerce.boolean().optional(),
  is_accessible: z.coerce.boolean().optional(),
  has_free_cancellation: z.coerce.boolean().optional(),
});

// Schema for trip availability check
export const tripAvailabilitySchema = z.object({
  trip_id: z.string().uuid({ message: "Valid trip ID is required" }),
  start_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Start date must be a valid date",
  }),
  end_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "End date must be a valid date",
  }),
  participants: z.coerce.number().int().positive().optional().default(1),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
export type SearchTripsInput = z.infer<typeof searchTripsSchema>;
export type TripAvailabilityInput = z.infer<typeof tripAvailabilitySchema>;

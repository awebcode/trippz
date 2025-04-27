import { z } from "zod";

export const createHotelSchema = z.object({
  name: z.string().min(2, { message: "Hotel name is required" }),
  address: z.string().min(5, { message: "Address is required" }),
  rating: z.number().min(0).max(5).optional(),
  price_per_night: z
    .number()
    .positive({ message: "Price per night must be a positive number" }),
  amenities: z.array(z.string()).optional(),
  available_rooms: z.number().int().positive().optional(),
  description: z.string().optional(),
  check_in_time: z.string().optional(),
  check_out_time: z.string().optional(),
  location: z
    .object({
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      city: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  cancellation_policy: z.string().optional(),
  images: z.array(z.string()).optional(),
});

export const updateHotelSchema = z.object({
  name: z.string().min(2, { message: "Hotel name is required" }).optional(),
  address: z.string().min(5, { message: "Address is required" }).optional(),
  rating: z.number().min(0).max(5).optional(),
  price_per_night: z
    .number()
    .positive({ message: "Price per night must be a positive number" })
    .optional(),
  amenities: z.array(z.string()).optional(),
  available_rooms: z.number().int().positive().optional(),
  description: z.string().optional(),
  check_in_time: z.string().optional(),
  check_out_time: z.string().optional(),
  location: z
    .object({
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      city: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  cancellation_policy: z.string().optional(),
  images: z.array(z.string()).optional(),
});

// Enhanced search hotels schema with proper validation
export const searchHotelsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  sortBy: z
    .enum(["created_at", "price_per_night", "rating", "name"])
    .optional()
    .default("created_at"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  location: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  check_in: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Check-in date must be a valid date",
    })
    .optional(),
  check_out: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Check-out date must be a valid date",
    })
    .optional(),
  guests: z.coerce.number().int().positive().optional(),
  rooms: z.coerce.number().int().positive().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  amenities: z.array(z.string()).optional(),
  distance_from_center: z.coerce.number().positive().optional(),
  has_free_cancellation: z.coerce.boolean().optional(),
  has_breakfast_included: z.coerce.boolean().optional(),
  has_parking: z.coerce.boolean().optional(),
  has_pool: z.coerce.boolean().optional(),
  has_gym: z.coerce.boolean().optional(),
  has_restaurant: z.coerce.boolean().optional(),
  has_room_service: z.coerce.boolean().optional(),
  has_spa: z.coerce.boolean().optional(),
  has_wifi: z.coerce.boolean().optional(),
  has_air_conditioning: z.coerce.boolean().optional(),
  is_pet_friendly: z.coerce.boolean().optional(),
  is_family_friendly: z.coerce.boolean().optional(),
});

// Schema for hotel availability check
export const hotelAvailabilitySchema = z.object({
  hotel_id: z.string().uuid({ message: "Valid hotel ID is required" }),
  check_in: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Check-in date must be a valid date",
  }),
  check_out: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Check-out date must be a valid date",
  }),
  guests: z.coerce.number().int().positive().optional().default(1),
  rooms: z.coerce.number().int().positive().optional().default(1),
});

export type CreateHotelInput = z.infer<typeof createHotelSchema>;
export type UpdateHotelInput = z.infer<typeof updateHotelSchema>;
export type SearchHotelsInput = z.infer<typeof searchHotelsSchema>;
export type HotelAvailabilityInput = z.infer<typeof hotelAvailabilitySchema>;

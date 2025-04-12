import { z } from "zod"

export const createHotelSchema = z
  .object({
    name: z.string().min(2, "Hotel name must be at least 2 characters"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    rating: z.number().min(0).max(5),
    price_per_night: z.number().positive("Price must be positive"),
    amenities: z.array(z.string()),
    available_rooms: z.number().int().positive("Available rooms must be positive"),
  })
  .strict();

export const updateHotelSchema = z
  .object({
    name: z.string().min(2, "Hotel name must be at least 2 characters").optional(),
    address: z.string().min(5, "Address must be at least 5 characters").optional(),
    rating: z.number().min(0).max(5).optional(),
    price_per_night: z.number().positive("Price must be positive").optional(),
    amenities: z.array(z.string()).optional(),
    available_rooms: z
      .number()
      .int()
      .positive("Available rooms must be positive")
      .optional(),
  })
  .strict();

export const searchHotelsSchema = z
  .object({
    location: z.string().optional(),
    check_in: z.string().optional(),
    check_out: z.string().optional(),
    guests: z.number().int().positive().optional(),
    min_price: z.number().optional(),
    max_price: z.number().optional(),
    amenities: z.array(z.string()).optional(),
    rating: z.number().min(0).max(5).optional(),
  })
  .strict();

export type CreateHotelInput = z.infer<typeof createHotelSchema>
export type UpdateHotelInput = z.infer<typeof updateHotelSchema>
export type SearchHotelsInput = z.infer<typeof searchHotelsSchema>

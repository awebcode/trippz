import { z } from "zod"
import { paginationQuerySchema, priceRangeQuerySchema } from "./commonValidators"

export const createHotelSchema = z
  .object({
    name: z
      .string({ required_error: "Hotel name is required" })
      .min(2, { message: "Hotel name must be at least 2 characters" }),
    address: z
      .string({ required_error: "Address is required" })
      .min(5, { message: "Address must be at least 5 characters" }),
    rating: z
      .number({ required_error: "Rating is required" })
      .min(0, { message: "Rating cannot be negative" })
      .max(5, { message: "Rating cannot exceed 5" }),
    price_per_night: z.number({ required_error: "Price per night is required" }).positive({
      message: "Price must be positive",
    }),
    amenities: z.array(z.string(), { required_error: "Amenities are required" }),
    available_rooms: z
      .number({ required_error: "Available rooms is required" })
      .int({ message: "Available rooms must be an integer" })
      .positive({ message: "Available rooms must be positive" }),
  })
  .strict()

export const updateHotelSchema = z
  .object({
    name: z.string().min(2, { message: "Hotel name must be at least 2 characters" }),
    address: z.string().min(5, { message: "Address must be at least 5 characters" }),
    rating: z.number().min(0, { message: "Rating cannot be negative" }).max(5, { message: "Rating cannot exceed 5" }),
    price_per_night: z.number().positive({ message: "Price must be positive" }),
    amenities: z.array(z.string()),
    available_rooms: z
      .number()
      .int({ message: "Available rooms must be an integer" })
      .positive({ message: "Available rooms must be positive" }),
  })
  .strict()
  .partial()

export const searchHotelsSchema = z
  .object({
    location: z.string().optional(),
    check_in: z.string().optional(),
    check_out: z.string().optional(),
    guests: z
      .number()
      .int({ message: "Guests must be an integer" })
      .positive({ message: "Guests must be positive" })
      .optional(),
    min_price: z.number().optional(),
    max_price: z.number().optional(),
    amenities: z.array(z.string()).optional(),
    rating: z.number().min(0).max(5).optional(),
  })
  .strict()
  .merge(paginationQuerySchema)
  .merge(priceRangeQuerySchema)

export type CreateHotelInput = z.infer<typeof createHotelSchema>
export type UpdateHotelInput = z.infer<typeof updateHotelSchema>
export type SearchHotelsInput = z.infer<typeof searchHotelsSchema>

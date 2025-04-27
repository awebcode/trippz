import { z } from "zod"

export const createHotelSchema = z.object({
  name: z.string().min(2, { message: "Hotel name is required" }),
  address: z.string().min(5, { message: "Address is required" }),
  rating: z.number().min(0).max(5).optional(),
  price_per_night: z.number().positive({ message: "Price per night must be a positive number" }),
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
})

export const updateHotelSchema = z.object({
  name: z.string().min(2, { message: "Hotel name is required" }).optional(),
  address: z.string().min(5, { message: "Address is required" }).optional(),
  rating: z.number().min(0).max(5).optional(),
  price_per_night: z.number().positive({ message: "Price per night must be a positive number" }).optional(),
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
})

export type CreateHotelInput = z.infer<typeof createHotelSchema>
export type UpdateHotelInput = z.infer<typeof updateHotelSchema>

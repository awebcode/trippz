import { z } from "zod"

export const destinationSchema = z.object({
  name: z.string().min(2, "Destination name must be at least 2 characters"),
  country: z.string().min(2, "Country name must be at least 2 characters"),
  city: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  highlights: z.array(z.string()),
  best_time_to_visit: z.string().optional(),
  travel_tips: z.array(z.string()),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  currency: z.string().optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  safety_index: z.number().min(0).max(10).optional(),
  cost_index: z.number().min(0).max(10).optional(),
  featured: z.boolean().optional(),
  meta_title: z.string().max(60).optional(),
  meta_description: z.string().max(160).optional(),
})

export const setFeaturedImageSchema = z.object({
  imageId: z.string().uuid("Image ID must be a valid UUID"),
})

export type DestinationInput = z.infer<typeof destinationSchema>
export type SetFeaturedImageInput = z.infer<typeof setFeaturedImageSchema>

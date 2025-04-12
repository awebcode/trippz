import { z } from "zod"

export const travelAgencyProfileSchema = z.object({
  agency_name: z.string().min(2, "Agency name must be at least 2 characters"),
  agency_address: z.string().optional(),
  agency_phone: z.string().optional(),
  agency_email: z.string().email("Invalid email address").optional(),
  website: z.string().url("Invalid URL").optional(),
  description: z.string().optional(),
})

export const travelPackageSchema = z.object({
  name: z.string().min(2, "Package name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be positive"),
  duration: z.number().int().positive("Duration must be a positive integer"),
  destination_ids: z.array(z.string().uuid()),
  inclusions: z.array(z.string()),
  exclusions: z.array(z.string()),
  itinerary: z.record(z.any()).optional(),
  max_travelers: z.number().int().positive().optional(),
})

export const packageResponseSchema = z.object({
  agency_response: z.string().min(1, "Response is required"),
})

export type TravelAgencyProfileInput = z.infer<typeof travelAgencyProfileSchema>
export type TravelPackageInput = z.infer<typeof travelPackageSchema>
export type PackageResponseInput = z.infer<typeof packageResponseSchema>

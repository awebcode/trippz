import { z } from "zod"

export const serviceProviderProfileSchema = z.object({
  business_name: z.string().min(2, "Business name must be at least 2 characters"),
  business_address: z.string().optional(),
  business_phone: z.string().optional(),
  business_email: z.string().email("Invalid email address").optional(),
  website: z.string().url("Invalid URL").optional(),
  description: z.string().optional(),
})

export const serviceSchema = z.object({
  name: z.string().min(2, "Service name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be positive"),
  duration: z.number().int().positive("Duration must be a positive integer"),
  location: z.string().optional(),
  category: z.string(),
  availability: z.record(z.any()).optional(),
  max_participants: z.number().int().positive().optional(),
})

export const serviceResponseSchema = z.object({
  provider_response: z.string().min(1, "Response is required"),
})

export type ServiceProviderProfileInput = z.infer<typeof serviceProviderProfileSchema>
export type ServiceInput = z.infer<typeof serviceSchema>
export type ServiceResponseInput = z.infer<typeof serviceResponseSchema>

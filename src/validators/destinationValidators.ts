import { z } from "zod"

export const destinationSchema = z.object({
  name: z.string().min(2, "Destination name must be at least 2 characters"),
  country: z.string().min(2, "Country name must be at least 2 characters"),
  city: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  highlights: z.array(z.string()),
  best_time_to_visit: z.string().optional(),
  travel_tips: z.array(z.string()),
})

export type DestinationInput = z.infer<typeof destinationSchema>

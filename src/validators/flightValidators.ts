import { z } from "zod"

export const createFlightSchema = z.object({
  flight_number: z.string().min(2, "Flight number must be at least 2 characters"),
  airline: z.string().min(2, "Airline name must be at least 2 characters"),
  departure_time: z.string(),
  arrival_time: z.string(),
  from_airport: z.string().min(3, "Airport code must be at least 3 characters"),
  to_airport: z.string().min(3, "Airport code must be at least 3 characters"),
  price: z.number().positive("Price must be positive"),
  seat_class: z.string(),
})

export const updateFlightSchema = z.object({
  flight_number: z.string().min(2, "Flight number must be at least 2 characters").optional(),
  airline: z.string().min(2, "Airline name must be at least 2 characters").optional(),
  departure_time: z.string().optional(),
  arrival_time: z.string().optional(),
  from_airport: z.string().min(3, "Airport code must be at least 3 characters").optional(),
  to_airport: z.string().min(3, "Airport code must be at least 3 characters").optional(),
  price: z.number().positive("Price must be positive").optional(),
  seat_class: z.string().optional(),
})

export const searchFlightsSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  departure_date: z.string().optional(),
  return_date: z.string().optional(),
  passengers: z.number().int().positive().optional(),
  seat_class: z.string().optional(),
  min_price: z.number().optional(),
  max_price: z.number().optional(),
  airline: z.string().optional(),
})

export type CreateFlightInput = z.infer<typeof createFlightSchema>
export type UpdateFlightInput = z.infer<typeof updateFlightSchema>
export type SearchFlightsInput = z.infer<typeof searchFlightsSchema>

import { z } from "zod"
import { paginationQuerySchema, priceRangeQuerySchema } from "./commonValidators"

export const createFlightSchema = z
  .object({
    flight_number: z
      .string({ required_error: "Flight number is required" })
      .min(2, { message: "Flight number must be at least 2 characters" }),
    airline: z
      .string({ required_error: "Airline name is required" })
      .min(2, { message: "Airline name must be at least 2 characters" }),
    departure_time: z.string({ required_error: "Departure time is required" }),
    arrival_time: z.string({ required_error: "Arrival time is required" }),
    from_airport: z
      .string({ required_error: "Departure airport is required" })
      .min(3, { message: "Airport code must be at least 3 characters" }),
    to_airport: z
      .string({ required_error: "Arrival airport is required" })
      .min(3, { message: "Airport code must be at least 3 characters" }),
    price: z.number({ required_error: "Price is required" }).positive({ message: "Price must be positive" }),
    seat_class: z.string({ required_error: "Seat class is required" }),
  })
  .strict()

export const updateFlightSchema = z
  .object({
    flight_number: z.string().min(2, { message: "Flight number must be at least 2 characters" }),
    airline: z.string().min(2, { message: "Airline name must be at least 2 characters" }),
    departure_time: z.string(),
    arrival_time: z.string(),
    from_airport: z.string().min(3, { message: "Airport code must be at least 3 characters" }),
    to_airport: z.string().min(3, { message: "Airport code must be at least 3 characters" }),
    price: z.number().positive({ message: "Price must be positive" }),
    seat_class: z.string(),
  })
  .strict()
  .partial()

export const searchFlightsSchema = z
  .object({
    from: z.string().optional(),
    to: z.string().optional(),
    departure_date: z.string().optional(),
    return_date: z.string().optional(),
    passengers: z
      .number()
      .int({ message: "Passengers must be an integer" })
      .positive({ message: "Passengers must be positive" })
      .optional(),
    seat_class: z.string().optional(),
    airline: z.string().optional(),
  })
  .strict()
  .merge(paginationQuerySchema)
  .merge(priceRangeQuerySchema)

export type CreateFlightInput = z.infer<typeof createFlightSchema>
export type UpdateFlightInput = z.infer<typeof updateFlightSchema>
export type SearchFlightsInput = z.infer<typeof searchFlightsSchema>

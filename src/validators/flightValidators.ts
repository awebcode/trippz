import { z } from "zod"

export const createFlightSchema = z.object({
  flight_number: z.string().min(2, { message: "Flight number is required" }),
  airline: z.string().min(2, { message: "Airline name is required" }),
  departure_time: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Departure time must be a valid date",
  }),
  arrival_time: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Arrival time must be a valid date",
  }),
  from_airport: z.string().min(3, { message: "From airport code is required" }),
  to_airport: z.string().min(3, { message: "To airport code is required" }),
  price: z.number().positive({ message: "Price must be a positive number" }),
  seat_class: z.string().min(1, { message: "Seat class is required" }),
  available_seats: z.number().int().positive().optional(),
  aircraft_type: z.string().optional(),
  has_wifi: z.boolean().optional(),
  has_entertainment: z.boolean().optional(),
  has_power_outlets: z.boolean().optional(),
  meal_service: z.boolean().optional(),
  baggage_allowance: z.number().int().optional(),
  cancellation_policy: z.string().optional(),
})

export const updateFlightSchema = z.object({
  flight_number: z.string().min(2, { message: "Flight number is required" }).optional(),
  airline: z.string().min(2, { message: "Airline name is required" }).optional(),
  departure_time: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Departure time must be a valid date",
    })
    .optional(),
  arrival_time: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Arrival time must be a valid date",
    })
    .optional(),
  from_airport: z.string().min(3, { message: "From airport code is required" }).optional(),
  to_airport: z.string().min(3, { message: "To airport code is required" }).optional(),
  price: z.number().positive({ message: "Price must be a positive number" }).optional(),
  seat_class: z.string().min(1, { message: "Seat class is required" }).optional(),
  available_seats: z.number().int().positive().optional(),
  aircraft_type: z.string().optional(),
  has_wifi: z.boolean().optional(),
  has_entertainment: z.boolean().optional(),
  has_power_outlets: z.boolean().optional(),
  meal_service: z.boolean().optional(),
  baggage_allowance: z.number().int().optional(),
  cancellation_policy: z.string().optional(),
})

export type CreateFlightInput = z.infer<typeof createFlightSchema>
export type UpdateFlightInput = z.infer<typeof updateFlightSchema>

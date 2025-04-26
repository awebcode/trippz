import { z } from "zod"
import { paginationQuerySchema } from "./commonValidators"

export const createBookingSchema = z
  .object({
    booking_type: z.enum(["FLIGHT", "HOTEL", "TRIP"], {
      required_error: "Booking type is required",
      invalid_type_error: "Booking type must be one of: FLIGHT, HOTEL, TRIP",
    }),
    start_date: z.string({ required_error: "Start date is required" }),
    end_date: z.string({ required_error: "End date is required" }),
    flight_id: z.string().uuid({ message: "Invalid flight ID format" }).optional(),
    hotel_id: z.string().uuid({ message: "Invalid hotel ID format" }).optional(),
    trip_id: z.string().uuid({ message: "Invalid trip ID format" }).optional(),
    guests: z.number().int().positive().optional(),
    special_requests: z.string().optional(),
  })
  .strict()
  .refine(
    (data) => {
      if (data.booking_type === "FLIGHT" && !data.flight_id) {
        return false
      }
      if (data.booking_type === "HOTEL" && !data.hotel_id) {
        return false
      }
      if (data.booking_type === "TRIP" && !data.trip_id) {
        return false
      }
      return true
    },
    {
      message: "ID for the selected booking type is required",
      path: ["booking_type"],
    },
  )

export const updateBookingSchema = z
  .object({
    start_date: z.string(),
    end_date: z.string(),
    status: z.enum(["PENDING", "CONFIRMED", "CANCELED", "COMPLETED"], {
      invalid_type_error: "Status must be one of: PENDING, CONFIRMED, CANCELED, COMPLETED",
    }),
    guests: z.number().int().positive(),
    special_requests: z.string(),
  })
  .strict()
  .partial()

export const bookingListQuerySchema = paginationQuerySchema.extend({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELED", "COMPLETED"]).optional(),
  booking_type: z.enum(["FLIGHT", "HOTEL", "TRIP"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>
export type BookingListQuery = z.infer<typeof bookingListQuerySchema>

import { z } from "zod"

export const createBookingSchema = z
  .object({
    booking_type: z.enum(["FLIGHT", "HOTEL", "TRIP"]),
    start_date: z.string(),
    end_date: z.string(),
    flight_id: z.string().uuid().optional(),
    hotel_id: z.string().uuid().optional(),
    trip_id: z.string().uuid().optional(),
  })
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

export const updateBookingSchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z.enum(["PENDING", "CONFIRMED", "CANCELED", "COMPLETED"]).optional(),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>

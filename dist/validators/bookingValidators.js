"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingListQuerySchema = exports.updateBookingSchema = exports.createBookingSchema = void 0;
const zod_1 = require("zod");
const commonValidators_1 = require("./commonValidators");
exports.createBookingSchema = zod_1.z
    .object({
    booking_type: zod_1.z.enum(["FLIGHT", "HOTEL", "TRIP"], {
        required_error: "Booking type is required",
        invalid_type_error: "Booking type must be one of: FLIGHT, HOTEL, TRIP",
    }),
    start_date: zod_1.z.string({ required_error: "Start date is required" }),
    end_date: zod_1.z.string({ required_error: "End date is required" }),
    flight_id: zod_1.z.string().uuid({ message: "Invalid flight ID format" }).optional(),
    hotel_id: zod_1.z.string().uuid({ message: "Invalid hotel ID format" }).optional(),
    trip_id: zod_1.z.string().uuid({ message: "Invalid trip ID format" }).optional(),
    guests: zod_1.z.number().int().positive().optional(),
    special_requests: zod_1.z.string().optional(),
})
    .strict()
    .refine((data) => {
    if (data.booking_type === "FLIGHT" && !data.flight_id) {
        return false;
    }
    if (data.booking_type === "HOTEL" && !data.hotel_id) {
        return false;
    }
    if (data.booking_type === "TRIP" && !data.trip_id) {
        return false;
    }
    return true;
}, {
    message: "ID for the selected booking type is required",
    path: ["booking_type"],
});
exports.updateBookingSchema = zod_1.z
    .object({
    start_date: zod_1.z.string(),
    end_date: zod_1.z.string(),
    status: zod_1.z.enum(["PENDING", "CONFIRMED", "CANCELED", "COMPLETED"], {
        invalid_type_error: "Status must be one of: PENDING, CONFIRMED, CANCELED, COMPLETED",
    }),
    guests: zod_1.z.number().int().positive(),
    special_requests: zod_1.z.string(),
})
    .strict()
    .partial();
exports.bookingListQuerySchema = commonValidators_1.paginationQuerySchema.extend({
    status: zod_1.z.enum(["PENDING", "CONFIRMED", "CANCELED", "COMPLETED"]).optional(),
    booking_type: zod_1.z.enum(["FLIGHT", "HOTEL", "TRIP"]).optional(),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
});
//# sourceMappingURL=bookingValidators.js.map
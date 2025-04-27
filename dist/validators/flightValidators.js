"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flightAvailabilitySchema = exports.searchFlightsSchema = exports.updateFlightSchema = exports.createFlightSchema = void 0;
const zod_1 = require("zod");
exports.createFlightSchema = zod_1.z.object({
    flight_number: zod_1.z.string().min(2, { message: "Flight number is required" }),
    airline: zod_1.z.string().min(2, { message: "Airline name is required" }),
    departure_time: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Departure time must be a valid date",
    }),
    arrival_time: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Arrival time must be a valid date",
    }),
    from_airport: zod_1.z.string().min(3, { message: "From airport code is required" }),
    to_airport: zod_1.z.string().min(3, { message: "To airport code is required" }),
    price: zod_1.z.number().positive({ message: "Price must be a positive number" }),
    seat_class: zod_1.z.string().min(1, { message: "Seat class is required" }),
    available_seats: zod_1.z.number().int().positive().optional(),
    aircraft_type: zod_1.z.string().optional(),
    has_wifi: zod_1.z.boolean().optional(),
    has_entertainment: zod_1.z.boolean().optional(),
    has_power_outlets: zod_1.z.boolean().optional(),
    meal_service: zod_1.z.boolean().optional(),
    baggage_allowance: zod_1.z.number().int().optional(),
    cancellation_policy: zod_1.z.string().optional(),
});
exports.updateFlightSchema = zod_1.z.object({
    flight_number: zod_1.z.string().min(2, { message: "Flight number is required" }).optional(),
    airline: zod_1.z.string().min(2, { message: "Airline name is required" }).optional(),
    departure_time: zod_1.z
        .string()
        .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Departure time must be a valid date",
    })
        .optional(),
    arrival_time: zod_1.z
        .string()
        .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Arrival time must be a valid date",
    })
        .optional(),
    from_airport: zod_1.z
        .string()
        .min(3, { message: "From airport code is required" })
        .optional(),
    to_airport: zod_1.z.string().min(3, { message: "To airport code is required" }).optional(),
    price: zod_1.z.number().positive({ message: "Price must be a positive number" }).optional(),
    seat_class: zod_1.z.string().min(1, { message: "Seat class is required" }).optional(),
    available_seats: zod_1.z.number().int().positive().optional(),
    aircraft_type: zod_1.z.string().optional(),
    has_wifi: zod_1.z.boolean().optional(),
    has_entertainment: zod_1.z.boolean().optional(),
    has_power_outlets: zod_1.z.boolean().optional(),
    meal_service: zod_1.z.boolean().optional(),
    baggage_allowance: zod_1.z.number().int().optional(),
    cancellation_policy: zod_1.z.string().optional(),
});
// Enhanced search flights schema with proper validation
exports.searchFlightsSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().optional().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).optional().default(10),
    sortBy: zod_1.z
        .enum(["departure_time", "arrival_time", "price", "airline", "created_at"])
        .optional()
        .default("departure_time"),
    sortOrder: zod_1.z.enum(["asc", "desc"]).optional().default("asc"),
    from: zod_1.z.string().optional(),
    to: zod_1.z.string().optional(),
    departure_date: zod_1.z
        .string()
        .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Departure date must be a valid date",
    })
        .optional(),
    return_date: zod_1.z
        .string()
        .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Return date must be a valid date",
    })
        .optional(),
    seat_class: zod_1.z.string().optional(),
    minPrice: zod_1.z.coerce.number().optional(),
    maxPrice: zod_1.z.coerce.number().optional(),
    airline: zod_1.z.string().optional(),
    direct_flights_only: zod_1.z.coerce.boolean().optional(),
    has_wifi: zod_1.z.coerce.boolean().optional(),
    has_entertainment: zod_1.z.coerce.boolean().optional(),
    has_power_outlets: zod_1.z.coerce.boolean().optional(),
    meal_service: zod_1.z.coerce.boolean().optional(),
    min_baggage_allowance: zod_1.z.coerce.number().int().optional(),
});
// Schema for flight availability check
exports.flightAvailabilitySchema = zod_1.z.object({
    flight_id: zod_1.z.string().uuid({ message: "Valid flight ID is required" }),
    date: zod_1.z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
        message: "Date must be a valid date",
    })
        .optional(),
    passengers: zod_1.z.coerce.number().int().positive().optional().default(1),
});
//# sourceMappingURL=flightValidators.js.map
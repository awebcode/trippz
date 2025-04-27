"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tripAvailabilitySchema = exports.searchTripsSchema = exports.updateTripSchema = exports.createTripSchema = void 0;
const zod_1 = require("zod");
exports.createTripSchema = zod_1.z.object({
    trip_name: zod_1.z.string().min(2, { message: "Trip name is required" }),
    description: zod_1.z.string().min(10, { message: "Description is required" }),
    start_date: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Start date must be a valid date",
    }),
    end_date: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "End date must be a valid date",
    }),
    trip_type: zod_1.z.enum(["ADVENTURE", "MEDICAL", "BUSINESS", "LEISURE"], {
        invalid_type_error: "Trip type must be one of: ADVENTURE, MEDICAL, BUSINESS, LEISURE",
    }),
    price: zod_1.z.number().positive({ message: "Price must be a positive number" }),
    destination_ids: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    max_participants: zod_1.z.number().int().positive().optional(),
    itinerary: zod_1.z.record(zod_1.z.string()).optional(),
    inclusions: zod_1.z.array(zod_1.z.string()).optional(),
    exclusions: zod_1.z.array(zod_1.z.string()).optional(),
    cancellation_policy: zod_1.z.string().optional(),
    images: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.updateTripSchema = zod_1.z.object({
    trip_name: zod_1.z.string().min(2, { message: "Trip name is required" }).optional(),
    description: zod_1.z.string().min(10, { message: "Description is required" }).optional(),
    start_date: zod_1.z
        .string()
        .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Start date must be a valid date",
    })
        .optional(),
    end_date: zod_1.z
        .string()
        .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "End date must be a valid date",
    })
        .optional(),
    trip_type: zod_1.z
        .enum(["ADVENTURE", "MEDICAL", "BUSINESS", "LEISURE"], {
        invalid_type_error: "Trip type must be one of: ADVENTURE, MEDICAL, BUSINESS, LEISURE",
    })
        .optional(),
    price: zod_1.z.number().positive({ message: "Price must be a positive number" }).optional(),
    destination_ids: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    max_participants: zod_1.z.number().int().positive().optional(),
    itinerary: zod_1.z.record(zod_1.z.string()).optional(),
    inclusions: zod_1.z.array(zod_1.z.string()).optional(),
    exclusions: zod_1.z.array(zod_1.z.string()).optional(),
    cancellation_policy: zod_1.z.string().optional(),
    images: zod_1.z.array(zod_1.z.string()).optional(),
});
// Enhanced search trips schema with proper validation
exports.searchTripsSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().optional().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).optional().default(10),
    sortBy: zod_1.z
        .enum(["created_at", "start_date", "end_date", "price", "trip_name"])
        .optional()
        .default("created_at"),
    sortOrder: zod_1.z.enum(["asc", "desc"]).optional().default("desc"),
    trip_type: zod_1.z.enum(["ADVENTURE", "MEDICAL", "BUSINESS", "LEISURE"]).optional(),
    destination: zod_1.z.string().optional(),
    start_date: zod_1.z
        .string()
        .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Start date must be a valid date",
    })
        .optional(),
    end_date: zod_1.z
        .string()
        .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "End date must be a valid date",
    })
        .optional(),
    minPrice: zod_1.z.coerce.number().optional(),
    maxPrice: zod_1.z.coerce.number().optional(),
    duration_min: zod_1.z.coerce.number().int().positive().optional(),
    duration_max: zod_1.z.coerce.number().int().positive().optional(),
    min_rating: zod_1.z.coerce.number().min(0).max(5).optional(),
    max_participants: zod_1.z.coerce.number().int().positive().optional(),
    has_availability: zod_1.z.coerce.boolean().optional(),
    includes_flight: zod_1.z.coerce.boolean().optional(),
    includes_hotel: zod_1.z.coerce.boolean().optional(),
    includes_activities: zod_1.z.coerce.boolean().optional(),
    includes_meals: zod_1.z.coerce.boolean().optional(),
    is_guided: zod_1.z.coerce.boolean().optional(),
    is_family_friendly: zod_1.z.coerce.boolean().optional(),
    is_accessible: zod_1.z.coerce.boolean().optional(),
    has_free_cancellation: zod_1.z.coerce.boolean().optional(),
});
// Schema for trip availability check
exports.tripAvailabilitySchema = zod_1.z.object({
    trip_id: zod_1.z.string().uuid({ message: "Valid trip ID is required" }),
    start_date: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Start date must be a valid date",
    }),
    end_date: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "End date must be a valid date",
    }),
    participants: zod_1.z.coerce.number().int().positive().optional().default(1),
});
//# sourceMappingURL=tripValidators.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hotelAvailabilitySchema = exports.searchHotelsSchema = exports.updateHotelSchema = exports.createHotelSchema = void 0;
const zod_1 = require("zod");
exports.createHotelSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, { message: "Hotel name is required" }),
    address: zod_1.z.string().min(5, { message: "Address is required" }),
    rating: zod_1.z.number().min(0).max(5).optional(),
    price_per_night: zod_1.z
        .number()
        .positive({ message: "Price per night must be a positive number" }),
    amenities: zod_1.z.array(zod_1.z.string()).optional(),
    available_rooms: zod_1.z.number().int().positive().optional(),
    description: zod_1.z.string().optional(),
    check_in_time: zod_1.z.string().optional(),
    check_out_time: zod_1.z.string().optional(),
    location: zod_1.z
        .object({
        latitude: zod_1.z.number().optional(),
        longitude: zod_1.z.number().optional(),
        city: zod_1.z.string().optional(),
        country: zod_1.z.string().optional(),
    })
        .optional(),
    cancellation_policy: zod_1.z.string().optional(),
    images: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.updateHotelSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, { message: "Hotel name is required" }).optional(),
    address: zod_1.z.string().min(5, { message: "Address is required" }).optional(),
    rating: zod_1.z.number().min(0).max(5).optional(),
    price_per_night: zod_1.z
        .number()
        .positive({ message: "Price per night must be a positive number" })
        .optional(),
    amenities: zod_1.z.array(zod_1.z.string()).optional(),
    available_rooms: zod_1.z.number().int().positive().optional(),
    description: zod_1.z.string().optional(),
    check_in_time: zod_1.z.string().optional(),
    check_out_time: zod_1.z.string().optional(),
    location: zod_1.z
        .object({
        latitude: zod_1.z.number().optional(),
        longitude: zod_1.z.number().optional(),
        city: zod_1.z.string().optional(),
        country: zod_1.z.string().optional(),
    })
        .optional(),
    cancellation_policy: zod_1.z.string().optional(),
    images: zod_1.z.array(zod_1.z.string()).optional(),
});
// Enhanced search hotels schema with proper validation
exports.searchHotelsSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().optional().default(1),
    limit: zod_1.z.coerce.number().int().positive().max(100).optional().default(10),
    sortBy: zod_1.z
        .enum(["created_at", "price_per_night", "rating", "name"])
        .optional()
        .default("created_at"),
    sortOrder: zod_1.z.enum(["asc", "desc"]).optional().default("desc"),
    location: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    check_in: zod_1.z
        .string()
        .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Check-in date must be a valid date",
    })
        .optional(),
    check_out: zod_1.z
        .string()
        .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "Check-out date must be a valid date",
    })
        .optional(),
    guests: zod_1.z.coerce.number().int().positive().optional(),
    rooms: zod_1.z.coerce.number().int().positive().optional(),
    minPrice: zod_1.z.coerce.number().optional(),
    maxPrice: zod_1.z.coerce.number().optional(),
    rating: zod_1.z.coerce.number().min(0).max(5).optional(),
    amenities: zod_1.z.array(zod_1.z.string()).optional(),
    distance_from_center: zod_1.z.coerce.number().positive().optional(),
    has_free_cancellation: zod_1.z.coerce.boolean().optional(),
    has_breakfast_included: zod_1.z.coerce.boolean().optional(),
    has_parking: zod_1.z.coerce.boolean().optional(),
    has_pool: zod_1.z.coerce.boolean().optional(),
    has_gym: zod_1.z.coerce.boolean().optional(),
    has_restaurant: zod_1.z.coerce.boolean().optional(),
    has_room_service: zod_1.z.coerce.boolean().optional(),
    has_spa: zod_1.z.coerce.boolean().optional(),
    has_wifi: zod_1.z.coerce.boolean().optional(),
    has_air_conditioning: zod_1.z.coerce.boolean().optional(),
    is_pet_friendly: zod_1.z.coerce.boolean().optional(),
    is_family_friendly: zod_1.z.coerce.boolean().optional(),
});
// Schema for hotel availability check
exports.hotelAvailabilitySchema = zod_1.z.object({
    hotel_id: zod_1.z.string().uuid({ message: "Valid hotel ID is required" }),
    check_in: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Check-in date must be a valid date",
    }),
    check_out: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Check-out date must be a valid date",
    }),
    guests: zod_1.z.coerce.number().int().positive().optional().default(1),
    rooms: zod_1.z.coerce.number().int().positive().optional().default(1),
});
//# sourceMappingURL=hotelValidators.js.map
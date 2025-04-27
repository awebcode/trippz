"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.packageResponseSchema = exports.travelPackageSchema = exports.travelAgencyProfileSchema = void 0;
const zod_1 = require("zod");
exports.travelAgencyProfileSchema = zod_1.z.object({
    agency_name: zod_1.z.string().min(2, "Agency name must be at least 2 characters"),
    agency_address: zod_1.z.string().optional(),
    agency_phone: zod_1.z.string().optional(),
    agency_email: zod_1.z.string().email("Invalid email address").optional(),
    website: zod_1.z.string().url("Invalid URL").optional(),
    description: zod_1.z.string().optional(),
});
exports.travelPackageSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Package name must be at least 2 characters"),
    description: zod_1.z.string().min(10, "Description must be at least 10 characters"),
    price: zod_1.z.number().positive("Price must be positive"),
    duration: zod_1.z.number().int().positive("Duration must be a positive integer"),
    destination_ids: zod_1.z.array(zod_1.z.string().uuid()),
    inclusions: zod_1.z.array(zod_1.z.string()),
    exclusions: zod_1.z.array(zod_1.z.string()),
    itinerary: zod_1.z.record(zod_1.z.any()).optional(),
    max_travelers: zod_1.z.number().int().positive().optional(),
});
exports.packageResponseSchema = zod_1.z.object({
    agency_response: zod_1.z.string().min(1, "Response is required"),
});
//# sourceMappingURL=travelAgencyValidators.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceResponseSchema = exports.serviceSchema = exports.serviceProviderProfileSchema = void 0;
const zod_1 = require("zod");
exports.serviceProviderProfileSchema = zod_1.z.object({
    business_name: zod_1.z.string().min(2, "Business name must be at least 2 characters"),
    business_address: zod_1.z.string().optional(),
    business_phone: zod_1.z.string().optional(),
    business_email: zod_1.z.string().email("Invalid email address").optional(),
    website: zod_1.z.string().url("Invalid URL").optional(),
    description: zod_1.z.string().optional(),
});
exports.serviceSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Service name must be at least 2 characters"),
    description: zod_1.z.string().min(10, "Description must be at least 10 characters"),
    price: zod_1.z.number().positive("Price must be positive"),
    duration: zod_1.z.number().int().positive("Duration must be a positive integer"),
    location: zod_1.z.string().optional(),
    category: zod_1.z.string(),
    availability: zod_1.z.record(zod_1.z.any()).optional(),
    max_participants: zod_1.z.number().int().positive().optional(),
});
exports.serviceResponseSchema = zod_1.z.object({
    provider_response: zod_1.z.string().min(1, "Response is required"),
});
//# sourceMappingURL=serviceProviderValidators.js.map
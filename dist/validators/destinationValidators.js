"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setFeaturedImageSchema = exports.destinationSchema = void 0;
const zod_1 = require("zod");
exports.destinationSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Destination name must be at least 2 characters"),
    country: zod_1.z.string().min(2, "Country name must be at least 2 characters"),
    city: zod_1.z.string().optional(),
    description: zod_1.z.string().min(10, "Description must be at least 10 characters"),
    highlights: zod_1.z.array(zod_1.z.string()),
    best_time_to_visit: zod_1.z.string().optional(),
    travel_tips: zod_1.z.array(zod_1.z.string()),
    latitude: zod_1.z.number().optional(),
    longitude: zod_1.z.number().optional(),
    currency: zod_1.z.string().optional(),
    language: zod_1.z.string().optional(),
    timezone: zod_1.z.string().optional(),
    safety_index: zod_1.z.number().min(0).max(10).optional(),
    cost_index: zod_1.z.number().min(0).max(10).optional(),
    featured: zod_1.z.boolean().optional(),
    meta_title: zod_1.z.string().max(60).optional(),
    meta_description: zod_1.z.string().max(160).optional(),
});
exports.setFeaturedImageSchema = zod_1.z.object({
    imageId: zod_1.z.string().uuid("Image ID must be a valid UUID"),
});
//# sourceMappingURL=destinationValidators.js.map
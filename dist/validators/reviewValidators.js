"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewListQuerySchema = exports.updateReviewSchema = exports.createReviewSchema = void 0;
const zod_1 = require("zod");
const commonValidators_1 = require("./commonValidators");
exports.createReviewSchema = zod_1.z
    .object({
    hotel_id: zod_1.z.string().uuid({ message: "Invalid hotel ID format" }).optional(),
    flight_id: zod_1.z.string().uuid({ message: "Invalid flight ID format" }).optional(),
    trip_id: zod_1.z.string().uuid({ message: "Invalid trip ID format" }).optional(),
    rating: zod_1.z
        .number({ required_error: "Rating is required" })
        .min(1, { message: "Rating must be at least 1" })
        .max(5, { message: "Rating cannot exceed 5" }),
    comment: zod_1.z.string().optional(),
})
    .strict()
    .refine((data) => {
    return !!(data.hotel_id || data.flight_id || data.trip_id);
}, {
    message: "At least one of hotel_id, flight_id, or trip_id is required",
    path: ["hotel_id"],
});
exports.updateReviewSchema = zod_1.z
    .object({
    rating: zod_1.z.number().min(1, { message: "Rating must be at least 1" }).max(5, { message: "Rating cannot exceed 5" }),
    comment: zod_1.z.string(),
})
    .strict()
    .partial();
exports.reviewListQuerySchema = commonValidators_1.paginationQuerySchema.extend({
    rating: zod_1.z.number().min(1).max(5).optional(),
    entityType: zod_1.z.enum(["hotel", "flight", "trip"]).optional(),
});
//# sourceMappingURL=reviewValidators.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commonQuerySchema = exports.priceRangeQuerySchema = exports.dateRangeQuerySchema = exports.searchQuerySchema = exports.paginationQuerySchema = exports.idParamSchema = void 0;
const zod_1 = require("zod");
// ID parameter validator
exports.idParamSchema = zod_1.z.object({
    id: zod_1.z.string().uuid({
        message: "Invalid ID format. Must be a valid UUID",
    }),
});
// Common pagination and sorting query parameters
exports.paginationQuerySchema = zod_1.z.object({
    page: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? Number.parseInt(val, 10) : 1))
        .pipe(zod_1.z.number().positive({ message: "Page must be a positive number" }).default(1)),
    limit: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? Number.parseInt(val, 10) : 10))
        .pipe(zod_1.z
        .number()
        .positive({ message: "Limit must be a positive number" })
        .max(100, { message: "Limit cannot exceed 100" })
        .default(10)),
    sortBy: zod_1.z.string().optional().default("created_at"),
    sortOrder: zod_1.z.enum(["asc", "desc"]).optional().default("desc"),
});
// Generic search query parameters
exports.searchQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
});
// Date range query parameters
exports.dateRangeQuerySchema = zod_1.z.object({
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
});
// Price range query parameters
exports.priceRangeQuerySchema = zod_1.z.object({
    minPrice: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? Number.parseFloat(val) : undefined)),
    maxPrice: zod_1.z
        .string()
        .optional()
        .transform((val) => (val ? Number.parseFloat(val) : undefined)),
});
// Combined common query parameters
exports.commonQuerySchema = exports.paginationQuerySchema.merge(exports.searchQuerySchema);
//# sourceMappingURL=commonValidators.js.map
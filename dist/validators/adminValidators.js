"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemSettingsSchema = exports.analyticsQuerySchema = exports.updateUserRoleSchema = exports.userQuerySchema = void 0;
const zod_1 = require("zod");
const commonValidators_1 = require("./commonValidators");
// User management validators
exports.userQuerySchema = commonValidators_1.commonQuerySchema.extend({
    role: zod_1.z.enum(["USER", "SERVICE_PROVIDER", "TRAVEL_AGENCY", "ADMIN"]).optional(),
    emailVerified: zod_1.z
        .string()
        .optional()
        .transform((val) => (val === "true" ? true : val === "false" ? false : undefined)),
    phoneVerified: zod_1.z
        .string()
        .optional()
        .transform((val) => (val === "true" ? true : val === "false" ? false : undefined)),
});
exports.updateUserRoleSchema = zod_1.z
    .object({
    role: zod_1.z.enum(["USER", "SERVICE_PROVIDER", "TRAVEL_AGENCY", "ADMIN"], {
        required_error: "Role is required",
        invalid_type_error: "Invalid role type",
    }),
})
    .strict();
// Dashboard analytics validators
exports.analyticsQuerySchema = zod_1.z
    .object({
    period: zod_1.z
        .enum(["daily", "weekly", "monthly", "yearly"], {
        required_error: "Period is required",
    })
        .default("monthly"),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
})
    .strict();
// System settings validators
exports.systemSettingsSchema = zod_1.z
    .object({
    maintenance_mode: zod_1.z.boolean({ required_error: "Maintenance mode setting is required" }),
    booking_fee_percentage: zod_1.z
        .number({
        required_error: "Booking fee percentage is required",
    })
        .min(0)
        .max(100),
    default_currency: zod_1.z.string({ required_error: "Default currency is required" }),
    support_email: zod_1.z.string({ required_error: "Support email is required" }).email(),
    support_phone: zod_1.z.string({ required_error: "Support phone is required" }),
    terms_url: zod_1.z.string({ required_error: "Terms URL is required" }).url(),
    privacy_url: zod_1.z.string({ required_error: "Privacy URL is required" }).url(),
})
    .strict();
//# sourceMappingURL=adminValidators.js.map
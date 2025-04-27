"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socialLoginSchema = exports.verifyPhoneSchema = exports.verifyEmailSchema = exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z
    .object({
    first_name: zod_1.z
        .string({ required_error: "First name is required" })
        .min(2, { message: "First name must be at least 2 characters" })
        .max(50, { message: "First name must be at most 50 characters" })
        .trim(),
    last_name: zod_1.z
        .string({ required_error: "Last name is required" })
        .min(2, { message: "Last name must be at least 2 characters" })
        .max(50, { message: "Last name must be at most 50 characters" })
        .trim(),
    email: zod_1.z
        .string({ required_error: "Email is required" })
        .email({ message: "Invalid email address" })
        .trim()
        .toLowerCase(),
    phone_number: zod_1.z
        .string()
        .min(10, { message: "Phone number must be at least 10 characters" })
        .max(20, { message: "Phone number must be at most 20 characters" })
        .optional(),
    password: zod_1.z
        .string({ required_error: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters" })
        .max(100, { message: "Password must be at most 100 characters" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
        .regex(/[0-9]/, { message: "Password must contain at least one number" }),
    role: zod_1.z
        .enum(["USER", "SERVICE_PROVIDER", "TRAVEL_AGENCY"], {
        invalid_type_error: "Role must be one of: USER, SERVICE_PROVIDER, TRAVEL_AGENCY",
    })
        .default("USER"),
    date_of_birth: zod_1.z
        .string()
        .refine((date) => !date || !isNaN(Date.parse(date)), {
        message: "Date of birth must be a valid date",
    })
        .optional(),
    address: zod_1.z.string().max(255, { message: "Address must be at most 255 characters" }).optional(),
})
    .strict();
exports.loginSchema = zod_1.z
    .object({
    email: zod_1.z.string().email({ message: "Invalid email address" }).trim().toLowerCase().optional(),
    phone_number: zod_1.z.string().min(10, { message: "Phone number must be at least 10 characters" }).optional(),
    password: zod_1.z.string({ required_error: "Password is required" }).min(1, { message: "Password is required" }),
})
    .strict()
    .refine((data) => {
    // Either email or phone_number must be provided
    return !!(data.email || data.phone_number);
}, {
    message: "Either email or phone number must be provided",
    path: ["email"],
});
exports.forgotPasswordSchema = zod_1.z
    .object({
    email: zod_1.z
        .string({ required_error: "Email is required" })
        .email({ message: "Invalid email address" })
        .trim()
        .toLowerCase(),
})
    .strict();
exports.resetPasswordSchema = zod_1.z
    .object({
    token: zod_1.z.string({ required_error: "Token is required" }),
    password: zod_1.z
        .string({ required_error: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters" })
        .max(100, { message: "Password must be at most 100 characters" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
        .regex(/[0-9]/, { message: "Password must contain at least one number" }),
    confirm_password: zod_1.z.string({ required_error: "Password confirmation is required" }),
})
    .strict()
    .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
});
exports.verifyEmailSchema = zod_1.z
    .object({
    token: zod_1.z.string({ required_error: "Token is required" }),
})
    .strict();
exports.verifyPhoneSchema = zod_1.z
    .object({
    code: zod_1.z.string({ required_error: "Verification code is required" }).length(6, {
        message: "Verification code must be 6 digits",
    }),
})
    .strict();
exports.socialLoginSchema = zod_1.z
    .object({
    provider: zod_1.z.enum(["GOOGLE", "FACEBOOK", "APPLE"], {
        required_error: "Provider is required",
        invalid_type_error: "Provider must be one of: GOOGLE, FACEBOOK, APPLE",
    }),
    token: zod_1.z.string({ required_error: "Token is required" }),
})
    .strict();
//# sourceMappingURL=authValidators.js.map
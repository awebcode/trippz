"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAddressSchema = exports.updatePasswordSchema = exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateProfileSchema = zod_1.z
    .object({
    first_name: zod_1.z.string().min(2, { message: "First name must be at least 2 characters" }),
    last_name: zod_1.z.string().min(2, { message: "Last name must be at least 2 characters" }),
    date_of_birth: zod_1.z.string({ required_error: "Date of birth is required" }),
    address: zod_1.z.string({ required_error: "Address is required" }),
    bio: zod_1.z.string({ required_error: "Bio is required" }),
    theme: zod_1.z.string({ required_error: "Theme preference is required" }),
    language: zod_1.z.string({ required_error: "Language preference is required" }),
})
    .strict();
exports.updatePasswordSchema = zod_1.z
    .object({
    current_password: zod_1.z.string({ required_error: "Current password is required" }),
    new_password: zod_1.z.string({ required_error: "New password is required" }).min(8, {
        message: "New password must be at least 8 characters",
    }),
    confirm_password: zod_1.z.string({ required_error: "Password confirmation is required" }),
})
    .strict()
    .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
});
exports.addAddressSchema = zod_1.z
    .object({
    address: zod_1.z.string({ required_error: "Address is required" }).min(1, { message: "Address cannot be empty" }),
    city: zod_1.z.string({ required_error: "City is required" }).min(1, { message: "City cannot be empty" }),
    country: zod_1.z.string({ required_error: "Country is required" }).min(1, { message: "Country cannot be empty" }),
    postal_code: zod_1.z
        .string({ required_error: "Postal code is required" })
        .min(1, { message: "Postal code cannot be empty" }),
})
    .strict();
//# sourceMappingURL=userValidators.js.map
import { z } from "zod";
export declare const updateProfileSchema: z.ZodObject<{
    first_name: z.ZodString;
    last_name: z.ZodString;
    date_of_birth: z.ZodString;
    address: z.ZodString;
    bio: z.ZodString;
    theme: z.ZodString;
    language: z.ZodString;
}, "strict", z.ZodTypeAny, {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    address: string;
    bio: string;
    theme: string;
    language: string;
}, {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    address: string;
    bio: string;
    theme: string;
    language: string;
}>;
export declare const updatePasswordSchema: z.ZodEffects<z.ZodObject<{
    current_password: z.ZodString;
    new_password: z.ZodString;
    confirm_password: z.ZodString;
}, "strict", z.ZodTypeAny, {
    confirm_password: string;
    current_password: string;
    new_password: string;
}, {
    confirm_password: string;
    current_password: string;
    new_password: string;
}>, {
    confirm_password: string;
    current_password: string;
    new_password: string;
}, {
    confirm_password: string;
    current_password: string;
    new_password: string;
}>;
export declare const addAddressSchema: z.ZodObject<{
    address: z.ZodString;
    city: z.ZodString;
    country: z.ZodString;
    postal_code: z.ZodString;
}, "strict", z.ZodTypeAny, {
    address: string;
    city: string;
    country: string;
    postal_code: string;
}, {
    address: string;
    city: string;
    country: string;
    postal_code: string;
}>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type AddAddressInput = z.infer<typeof addAddressSchema>;
//# sourceMappingURL=userValidators.d.ts.map
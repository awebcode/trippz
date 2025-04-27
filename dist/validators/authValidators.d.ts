import { z } from "zod";
export declare const registerSchema: z.ZodObject<{
    first_name: z.ZodString;
    last_name: z.ZodString;
    email: z.ZodString;
    phone_number: z.ZodOptional<z.ZodString>;
    password: z.ZodString;
    role: z.ZodDefault<z.ZodEnum<["USER", "SERVICE_PROVIDER", "TRAVEL_AGENCY"]>>;
    date_of_birth: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    address: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    first_name: string;
    email: string;
    role: "USER" | "SERVICE_PROVIDER" | "TRAVEL_AGENCY";
    last_name: string;
    password: string;
    phone_number?: string | undefined;
    date_of_birth?: string | undefined;
    address?: string | undefined;
}, {
    first_name: string;
    email: string;
    last_name: string;
    password: string;
    role?: "USER" | "SERVICE_PROVIDER" | "TRAVEL_AGENCY" | undefined;
    phone_number?: string | undefined;
    date_of_birth?: string | undefined;
    address?: string | undefined;
}>;
export declare const loginSchema: z.ZodEffects<z.ZodObject<{
    email: z.ZodOptional<z.ZodString>;
    phone_number: z.ZodOptional<z.ZodString>;
    password: z.ZodString;
}, "strict", z.ZodTypeAny, {
    password: string;
    email?: string | undefined;
    phone_number?: string | undefined;
}, {
    password: string;
    email?: string | undefined;
    phone_number?: string | undefined;
}>, {
    password: string;
    email?: string | undefined;
    phone_number?: string | undefined;
}, {
    password: string;
    email?: string | undefined;
    phone_number?: string | undefined;
}>;
export declare const forgotPasswordSchema: z.ZodObject<{
    email: z.ZodString;
}, "strict", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const resetPasswordSchema: z.ZodEffects<z.ZodObject<{
    token: z.ZodString;
    password: z.ZodString;
    confirm_password: z.ZodString;
}, "strict", z.ZodTypeAny, {
    password: string;
    token: string;
    confirm_password: string;
}, {
    password: string;
    token: string;
    confirm_password: string;
}>, {
    password: string;
    token: string;
    confirm_password: string;
}, {
    password: string;
    token: string;
    confirm_password: string;
}>;
export declare const verifyEmailSchema: z.ZodObject<{
    token: z.ZodString;
}, "strict", z.ZodTypeAny, {
    token: string;
}, {
    token: string;
}>;
export declare const verifyPhoneSchema: z.ZodObject<{
    code: z.ZodString;
}, "strict", z.ZodTypeAny, {
    code: string;
}, {
    code: string;
}>;
export declare const socialLoginSchema: z.ZodObject<{
    provider: z.ZodEnum<["GOOGLE", "FACEBOOK", "APPLE"]>;
    token: z.ZodString;
}, "strict", z.ZodTypeAny, {
    token: string;
    provider: "GOOGLE" | "FACEBOOK" | "APPLE";
}, {
    token: string;
    provider: "GOOGLE" | "FACEBOOK" | "APPLE";
}>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type VerifyPhoneInput = z.infer<typeof verifyPhoneSchema>;
export type SocialLoginInput = z.infer<typeof socialLoginSchema>;
//# sourceMappingURL=authValidators.d.ts.map
import { z } from "zod";

export const registerSchema = z
  .object({
    full_name: z.string().min(2, "First name must be at least 2 characters"),
    //  last_name: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    // phone_number: z.string().min(10, "Phone number must be at least 10 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    // confirm_password: z.string(),
    // role: z.enum(["USER", "SERVICE_PROVIDER"]).default("USER"),
    // date_of_birth: z.string().optional(),
    // address: z.string().optional(),
  })
  .strict();
// .refine((data) => data.password === data.confirm_password, {
//   message: "Passwords don't match",
//   path: ["confirm_password"],
// })
export const loginSchema = z
  .object({
    email: z.string().email("Invalid email address").optional(),
    phone_number: z
      .string()
      .min(10, "Phone number must be at least 10 characters")
      .optional(),
    password: z.string().min(1, "Password is required"),
  })
  .strict()
  .refine((data) => data.email || data.phone_number, {
    message: "Either email or phone number is required",
    path: ["email", "phone_number"],
  });

export const forgotPasswordSchema = z
  .object({
    email: z.string().email("Invalid email address"),
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    token: z.string(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
  })
  .strict()
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

export const verifyEmailSchema = z
  .object({
    token: z.string(),
  })
  .strict();

export const verifyPhoneSchema = z
  .object({
    code: z.string().length(6, "Verification code must be 6 digits"),
  })
  .strict();

export const socialLoginSchema = z
  .object({
    provider: z.enum(["GOOGLE", "FACEBOOK", "APPLE"]),
    token: z.string(),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type VerifyPhoneInput = z.infer<typeof verifyPhoneSchema>;
export type SocialLoginInput = z.infer<typeof socialLoginSchema>;

import { z } from "zod";

export const registerSchema = z
  .object({
    full_name: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone_number: z
      .string()
      .min(10, "Phone number must be at least 10 characters")
      .optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    // confirm_password: z.string(),
    role: z.enum(["USER", "SERVICE_PROVIDER", "TRAVEL_AGENCY", "ADMIN"]).default("USER"),
    date_of_birth: z.string().optional(),
    address: z.string().optional(),
  })
  // .refine((data) => data.password === data.confirm_password, {
  //   message: "Passwords don't match",
  //   path: ["confirm_password"],
  // });

export const loginSchema = z
  .object({
    email: z.string().email("Invalid email address").optional(),
    phone_number: z
      .string()
      .min(10, "Phone number must be at least 10 characters")
      .optional(),
    password: z.string().min(1, "Password is required"),
  })
  .refine(
    (data) => {
      // Either email or phone_number must be provided
      return !!(data.email || data.phone_number);
    },
    {
      message: "Either email or phone number must be provided",
      path: ["email"],
    }
  );

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  });

export const verifyEmailSchema = z.object({
  token: z.string(),
});

export const verifyPhoneSchema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits"),
});

export const socialLoginSchema = z.object({
  provider: z.enum(["GOOGLE", "FACEBOOK", "APPLE"]),
  token: z.string(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type VerifyPhoneInput = z.infer<typeof verifyPhoneSchema>;
export type SocialLoginInput = z.infer<typeof socialLoginSchema>;

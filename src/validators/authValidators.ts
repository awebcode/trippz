import { z } from "zod"

export const registerSchema = z
  .object({
    first_name: z
      .string({ required_error: "First name is required" })
      .min(2, { message: "First name must be at least 2 characters" })
      .max(50, { message: "First name must be at most 50 characters" })
      .trim(),
    last_name: z
      .string({ required_error: "Last name is required" })
      .min(2, { message: "Last name must be at least 2 characters" })
      .max(50, { message: "Last name must be at most 50 characters" })
      .trim(),
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Invalid email address" })
      .trim()
      .toLowerCase(),
    phone_number: z
      .string()
      .min(10, { message: "Phone number must be at least 10 characters" })
      .max(20, { message: "Phone number must be at most 20 characters" })
      .optional(),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters" })
      .max(100, { message: "Password must be at most 100 characters" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" }),
    role: z
      .enum(["USER", "SERVICE_PROVIDER", "TRAVEL_AGENCY"], {
        invalid_type_error: "Role must be one of: USER, SERVICE_PROVIDER, TRAVEL_AGENCY",
      })
      .default("USER"),
    date_of_birth: z
      .string()
      .refine((date) => !date || !isNaN(Date.parse(date)), {
        message: "Date of birth must be a valid date",
      })
      .optional(),
    address: z.string().max(255, { message: "Address must be at most 255 characters" }).optional(),
  })
  .strict()

export const loginSchema = z
  .object({
    email: z.string().email({ message: "Invalid email address" }).trim().toLowerCase().optional(),
    phone_number: z.string().min(10, { message: "Phone number must be at least 10 characters" }).optional(),
    password: z.string({ required_error: "Password is required" }).min(1, { message: "Password is required" }),
  })
  .strict()
  .refine(
    (data) => {
      // Either email or phone_number must be provided
      return !!(data.email || data.phone_number)
    },
    {
      message: "Either email or phone number must be provided",
      path: ["email"],
    },
  )

export const forgotPasswordSchema = z
  .object({
    email: z
      .string({ required_error: "Email is required" })
      .email({ message: "Invalid email address" })
      .trim()
      .toLowerCase(),
  })
  .strict()

export const resetPasswordSchema = z
  .object({
    token: z.string({ required_error: "Token is required" }),
    password: z
      .string({ required_error: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters" })
      .max(100, { message: "Password must be at most 100 characters" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" }),
    confirm_password: z.string({ required_error: "Password confirmation is required" }),
  })
  .strict()
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  })

export const verifyEmailSchema = z
  .object({
    token: z.string({ required_error: "Token is required" }),
  })
  .strict()

export const verifyPhoneSchema = z
  .object({
    code: z.string({ required_error: "Verification code is required" }).length(6, {
      message: "Verification code must be 6 digits",
    }),
  })
  .strict()

export const socialLoginSchema = z
  .object({
    provider: z.enum(["GOOGLE", "FACEBOOK", "APPLE"], {
      required_error: "Provider is required",
      invalid_type_error: "Provider must be one of: GOOGLE, FACEBOOK, APPLE",
    }),
    token: z.string({ required_error: "Token is required" }),
  })
  .strict()

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>
export type VerifyPhoneInput = z.infer<typeof verifyPhoneSchema>
export type SocialLoginInput = z.infer<typeof socialLoginSchema>

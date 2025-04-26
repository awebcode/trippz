import { z } from "zod"
import { commonQuerySchema } from "./commonValidators"

// User management validators
export const userQuerySchema = commonQuerySchema.extend({
  role: z.enum(["USER", "SERVICE_PROVIDER", "TRAVEL_AGENCY", "ADMIN"]).optional(),
  emailVerified: z
    .string()
    .optional()
    .transform((val) => (val === "true" ? true : val === "false" ? false : undefined)),
  phoneVerified: z
    .string()
    .optional()
    .transform((val) => (val === "true" ? true : val === "false" ? false : undefined)),
})

export const updateUserRoleSchema = z
  .object({
    role: z.enum(["USER", "SERVICE_PROVIDER", "TRAVEL_AGENCY", "ADMIN"], {
      required_error: "Role is required",
      invalid_type_error: "Invalid role type",
    }),
  })
  .strict()

// Dashboard analytics validators
export const analyticsQuerySchema = z
  .object({
    period: z
      .enum(["daily", "weekly", "monthly", "yearly"], {
        required_error: "Period is required",
      })
      .default("monthly"),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  })
  .strict()

// System settings validators
export const systemSettingsSchema = z
  .object({
    maintenance_mode: z.boolean({ required_error: "Maintenance mode setting is required" }),
    booking_fee_percentage: z
      .number({
        required_error: "Booking fee percentage is required",
      })
      .min(0)
      .max(100),
    default_currency: z.string({ required_error: "Default currency is required" }),
    support_email: z.string({ required_error: "Support email is required" }).email(),
    support_phone: z.string({ required_error: "Support phone is required" }),
    terms_url: z.string({ required_error: "Terms URL is required" }).url(),
    privacy_url: z.string({ required_error: "Privacy URL is required" }).url(),
  })
  .strict()

// Export types
export type UserQuery = z.infer<typeof userQuerySchema>
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>
export type SystemSettingsInput = z.infer<typeof systemSettingsSchema>

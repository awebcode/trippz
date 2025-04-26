import { z } from "zod"

export const updateProfileSchema = z
  .object({
    first_name: z.string().min(2, { message: "First name must be at least 2 characters" }),
    last_name: z.string().min(2, { message: "Last name must be at least 2 characters" }),
    date_of_birth: z.string({ required_error: "Date of birth is required" }),
    address: z.string({ required_error: "Address is required" }),
    bio: z.string({ required_error: "Bio is required" }),
    theme: z.string({ required_error: "Theme preference is required" }),
    language: z.string({ required_error: "Language preference is required" }),
  })
  .strict()

export const updatePasswordSchema = z
  .object({
    current_password: z.string({ required_error: "Current password is required" }),
    new_password: z.string({ required_error: "New password is required" }).min(8, {
      message: "New password must be at least 8 characters",
    }),
    confirm_password: z.string({ required_error: "Password confirmation is required" }),
  })
  .strict()
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  })

export const addAddressSchema = z
  .object({
    address: z.string({ required_error: "Address is required" }).min(1, { message: "Address cannot be empty" }),
    city: z.string({ required_error: "City is required" }).min(1, { message: "City cannot be empty" }),
    country: z.string({ required_error: "Country is required" }).min(1, { message: "Country cannot be empty" }),
    postal_code: z
      .string({ required_error: "Postal code is required" })
      .min(1, { message: "Postal code cannot be empty" }),
  })
  .strict()

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>
export type AddAddressInput = z.infer<typeof addAddressSchema>

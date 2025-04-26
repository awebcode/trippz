import { z } from "zod"
import { paginationQuerySchema } from "./commonValidators"

export const createPaymentSchema = z
  .object({
    booking_id: z.string({ required_error: "Booking ID is required" }).uuid({ message: "Invalid booking ID format" }),
    payment_method: z.enum(["CREDIT_CARD", "PAYPAL", "GOOGLE_PAY", "APPLE_PAY"], {
      required_error: "Payment method is required",
      invalid_type_error: "Payment method must be one of: CREDIT_CARD, PAYPAL, GOOGLE_PAY, APPLE_PAY",
    }),
    card_number: z.string().optional(),
    card_expiry: z.string().optional(),
    card_cvv: z.string().optional(),
    billing_address: z.string().optional(),
  })
  .strict()
  .refine(
    (data) => {
      if (data.payment_method === "CREDIT_CARD") {
        return !!data.card_number && !!data.card_expiry && !!data.card_cvv
      }
      return true
    },
    {
      message: "Card details are required for credit card payments",
      path: ["payment_method"],
    },
  )

export const paymentListQuerySchema = paginationQuerySchema.extend({
  status: z.enum(["SUCCESS", "PENDING", "FAILED", "REFUNDED"]).optional(),
  payment_method: z.enum(["CREDIT_CARD", "PAYPAL", "GOOGLE_PAY", "APPLE_PAY"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>
export type PaymentListQuery = z.infer<typeof paymentListQuerySchema>

import { z } from "zod"

export const createPaymentSchema = z
  .object({
    booking_id: z.string().uuid(),
    payment_method: z.enum(["CREDIT_CARD", "PAYPAL", "GOOGLE_PAY", "APPLE_PAY"]),
    card_number: z.string().optional(),
    card_expiry: z.string().optional(),
    card_cvv: z.string().optional(),
    billing_address: z.string().optional(),
  })
  .strict()
  .refine(
    (data) => {
      if (data.payment_method === "CREDIT_CARD") {
        return !!data.card_number && !!data.card_expiry && !!data.card_cvv;
      }
      return true;
    },
    {
      message: "Card details are required for credit card payments",
      path: ["payment_method"],
    }
  );

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>

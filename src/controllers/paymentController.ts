import type { Request, Response, NextFunction } from "express"
import { PaymentService } from "../services/paymentService"
import { catchAsync } from "../utils/catchAsync"
import type { CreatePaymentInput } from "../validators/paymentValidators"

export class PaymentController {
  static processPayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const data = req.body as CreatePaymentInput
    const result = await PaymentService.processPayment(userId, data)

    res.status(200).json({
      status: "success",
      data: result,
    })
  })

  static getPayments = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const payments = await PaymentService.getPaymentsByUser(userId)

    res.status(200).json({
      status: "success",
      data: payments,
    })
  })

  static getPaymentById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const paymentId = req.params.id
    const payment = await PaymentService.getPaymentById(userId, paymentId)

    res.status(200).json({
      status: "success",
      data: payment,
    })
  })

  static refundPayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const paymentId = req.params.id
    const result = await PaymentService.refundPayment(userId, paymentId)

    res.status(200).json({
      status: "success",
      data: result,
    })
  })
}

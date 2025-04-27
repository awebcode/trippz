import type { Request, Response } from "express"
import { BookingService } from "../services/bookingService"
import { catchAsync } from "../utils/catchAsync"
import { idParamSchema } from "../validators/commonValidators"
import type { BookingListQuery } from "../validators/bookingValidators"

export class BookingController {
  static createBooking = catchAsync(async (req: Request, res: Response) => {
    const userId = req.currentUser.id
    const booking = await BookingService.createBooking(userId, req.body)

    res.status(201).json({
      status: "success",
      data: {
        booking,
      },
    })
  })

  static getBookings = catchAsync(async (req: Request, res: Response) => {
    const userId = req.currentUser.id
    const params = req.validatedQuery as unknown as BookingListQuery
    const result = await BookingService.getBookings(userId, params)

    res.status(200).json({
      status: "success",
      data: result.data,
      metadata: result.metadata,
    })
  })

  static getBookingById = catchAsync(async (req: Request, res: Response) => {
    const userId = req.currentUser.id
    const { id } = idParamSchema.parse(req.params)
    const booking = await BookingService.getBookingById(userId, id)

    res.status(200).json({
      status: "success",
      data: {
        booking,
      },
    })
  })

  static updateBooking = catchAsync(async (req: Request, res: Response) => {
    const userId = req.currentUser.id
    const { id } = idParamSchema.parse(req.params)
    const booking = await BookingService.updateBooking(userId, id, req.body)

    res.status(200).json({
      status: "success",
      data: {
        booking,
      },
    })
  })

  static cancelBooking = catchAsync(async (req: Request, res: Response) => {
    const userId = req.currentUser.id
    const { id } = idParamSchema.parse(req.params)
    const result = await BookingService.cancelBooking(userId, id)

    res.status(200).json({
      status: "success",
      message: result.message,
      data: {
        booking: result.booking,
      },
    })
  })
}

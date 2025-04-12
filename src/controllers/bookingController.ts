import type { Request, Response, NextFunction } from "express"
import { BookingService } from "../services/bookingService"
import { catchAsync } from "../utils/catchAsync"
import type { CreateBookingInput, UpdateBookingInput } from "../validators/bookingValidators"

export class BookingController {
  static createBooking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const data = req.body as CreateBookingInput
    const booking = await BookingService.createBooking(userId, data)

    res.status(201).json({
      status: "success",
      data: booking,
    })
  })

  static getBookings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const bookings = await BookingService.getBookings(userId)

    res.status(200).json({
      status: "success",
      data: bookings,
    })
  })

  static getBookingById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const bookingId = req.params.id
    const booking = await BookingService.getBookingById(userId, bookingId)

    res.status(200).json({
      status: "success",
      data: booking,
    })
  })

  static updateBooking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const bookingId = req.params.id
    const data = req.body as UpdateBookingInput
    const booking = await BookingService.updateBooking(userId, bookingId, data)

    res.status(200).json({
      status: "success",
      data: booking,
    })
  })

  static cancelBooking = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const bookingId = req.params.id
    const result = await BookingService.cancelBooking(userId, bookingId)

    res.status(200).json({
      status: "success",
      data: result,
    })
  })
}

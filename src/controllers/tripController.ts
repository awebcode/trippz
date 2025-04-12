import type { Request, Response, NextFunction } from "express"
import { TripService } from "../services/tripService"
import { catchAsync } from "../utils/catchAsync"
import type { CreateTripInput, UpdateTripInput, SearchTripsInput } from "../validators/tripValidators"

export class TripController {
  static createTrip = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const data = req.body as CreateTripInput
    const trip = await TripService.createTrip(userId, data)

    res.status(201).json({
      status: "success",
      data: trip,
    })
  })

  static getTrips = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const trips = await TripService.getTrips()

    res.status(200).json({
      status: "success",
      data: trips,
    })
  })

  static getTripById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const tripId = req.params.id
    const trip = await TripService.getTripById(tripId)

    res.status(200).json({
      status: "success",
      data: trip,
    })
  })

  static updateTrip = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const tripId = req.params.id
    const data = req.body as UpdateTripInput
    const trip = await TripService.updateTrip(userId, tripId, data)

    res.status(200).json({
      status: "success",
      data: trip,
    })
  })

  static deleteTrip = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const tripId = req.params.id
    const result = await TripService.deleteTrip(userId, tripId)

    res.status(200).json({
      status: "success",
      data: result,
    })
  })

  static searchTrips = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const params = req.query as unknown as SearchTripsInput
    const trips = await TripService.searchTrips(params)

    res.status(200).json({
      status: "success",
      data: trips,
    })
  })
}

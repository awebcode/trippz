import type { Request, Response, NextFunction } from "express"
import { FlightService } from "../services/flightService"
import { catchAsync } from "../utils/catchAsync"
import type { CreateFlightInput, UpdateFlightInput, SearchFlightsInput } from "../validators/flightValidators"

export class FlightController {
  static createFlight = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body as CreateFlightInput
    const flight = await FlightService.createFlight(data)

    res.status(201).json({
      status: "success",
      data: flight,
    })
  })

  static getFlights = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const flights = await FlightService.getFlights()

    res.status(200).json({
      status: "success",
      data: flights,
    })
  })

  static getFlightById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const flightId = req.params.id
    const flight = await FlightService.getFlightById(flightId)

    res.status(200).json({
      status: "success",
      data: flight,
    })
  })

  static updateFlight = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const flightId = req.params.id
    const data = req.body as UpdateFlightInput
    const flight = await FlightService.updateFlight(flightId, data)

    res.status(200).json({
      status: "success",
      data: flight,
    })
  })

  static deleteFlight = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const flightId = req.params.id
    const result = await FlightService.deleteFlight(flightId)

    res.status(200).json({
      status: "success",
      data: result,
    })
  })

  static searchFlights = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const params = req.query as unknown as SearchFlightsInput
    const flights = await FlightService.searchFlights(params)

    res.status(200).json({
      status: "success",
      data: flights,
    })
  })
}

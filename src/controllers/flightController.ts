import type { Request, Response, NextFunction } from "express"
import { FlightService } from "../services/flightService"
import { catchAsync } from "../utils/catchAsync"
import { AppError } from "../utils/appError"

export class FlightController {
  static getAllFlights = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 20
    const filters = {
      from: req.query.from as string,
      to: req.query.to as string,
      departure_date: req.query.departure_date as string,
      return_date: req.query.return_date as string,
      airline: req.query.airline as string,
      minPrice: req.query.minPrice ? Number.parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? Number.parseFloat(req.query.maxPrice as string) : undefined,
      seat_class: req.query.seat_class as string,
    }
    const sortOptions = {
      sortBy: (req.query.sortBy as string) || "departure_time",
      sortOrder: (req.query.sortOrder as "asc" | "desc") || "asc",
    }

    const flights = await FlightService.getAllFlights(page, limit, filters, sortOptions)

    res.status(200).json({
      success: true,
      data: flights.data,
      metadata: flights.metadata,
    })
  })

  static getFlightById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const flightId = req.params.id
    const flight = await FlightService.getFlightById(flightId)

    if (!flight) {
      return next(new AppError("Flight not found", 404))
    }

    res.status(200).json({
      success: true,
      data: flight,
    })
  })

  static createFlight = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const flightData = req.body
    const flight = await FlightService.createFlight(flightData)

    res.status(201).json({
      success: true,
      message: "Flight created successfully",
      data: flight,
    })
  })

  static updateFlight = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const flightId = req.params.id
    const flightData = req.body
    const flight = await FlightService.updateFlight(flightId, flightData)

    res.status(200).json({
      success: true,
      message: "Flight updated successfully",
      data: flight,
    })
  })

  static deleteFlight = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const flightId = req.params.id
    await FlightService.deleteFlight(flightId)

    res.status(200).json({
      success: true,
      message: "Flight deleted successfully",
    })
  })

  static searchFlights = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 20
    const searchParams = {
      from: req.query.from as string,
      to: req.query.to as string,
      departure_date: req.query.departure_date as string,
      return_date: req.query.return_date as string,
      passengers: req.query.passengers ? Number.parseInt(req.query.passengers as string) : undefined,
      seat_class: req.query.seat_class as string,
      airline: req.query.airline as string,
      minPrice: req.query.minPrice ? Number.parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? Number.parseFloat(req.query.maxPrice as string) : undefined,
    }
    const sortOptions = {
      sortBy: (req.query.sortBy as string) || "price",
      sortOrder: (req.query.sortOrder as "asc" | "desc") || "asc",
    }

    const flights = await FlightService.searchFlights(searchParams, page, limit, sortOptions)

    res.status(200).json({
      success: true,
      data: flights.data,
      metadata: flights.metadata,
    })
  })

  static getFlightAvailability = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const flightId = req.params.id
    const availability = await FlightService.getFlightAvailability(flightId)

    res.status(200).json({
      success: true,
      data: availability,
    })
  })
}

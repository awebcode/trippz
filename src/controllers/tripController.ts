import type { Request, Response, NextFunction } from "express"
import { TripService } from "../services/tripService"
import { catchAsync } from "../utils/catchAsync"
import { AppError } from "../utils/appError"

export class TripController {
  static getAllTrips = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 20
    const filters = {
      trip_type: req.query.trip_type as string,
      start_date: req.query.start_date as string,
      end_date: req.query.end_date as string,
      minPrice: req.query.minPrice ? Number.parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? Number.parseFloat(req.query.maxPrice as string) : undefined,
    }
    const sortOptions = {
      sortBy: (req.query.sortBy as string) || "created_at",
      sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
    }

    const trips = await TripService.getAllTrips(page, limit, filters, sortOptions)

    res.status(200).json({
      success: true,
      data: trips.data,
      metadata: trips.metadata,
    })
  })

  static getTripById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const tripId = req.params.id
    const trip = await TripService.getTripById(tripId)

    if (!trip) {
      return next(new AppError("Trip not found", 404))
    }

    res.status(200).json({
      success: true,
      data: trip,
    })
  })

  static createTrip = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.currentUser.id
    const tripData = { ...req.body, user_id: userId }
    const trip = await TripService.createTrip(tripData)

    res.status(201).json({
      success: true,
      message: "Trip created successfully",
      data: trip,
    })
  })

  static updateTrip = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const tripId = req.params.id
    const userId = req.currentUser.id
    const tripData = req.body

    // Check if the trip belongs to the user or user is admin
    const trip = await TripService.getTripById(tripId)
    if (!trip) {
      return next(new AppError("Trip not found", 404))
    }

    if (trip.user_id !== userId && req.currentUser.role !== "ADMIN") {
      return next(new AppError("You are not authorized to update this trip", 403))
    }

    const updatedTrip = await TripService.updateTrip(tripId, tripData)

    res.status(200).json({
      success: true,
      message: "Trip updated successfully",
      data: updatedTrip,
    })
  })

  static deleteTrip = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const tripId = req.params.id
    const userId = req.currentUser.id

    // Check if the trip belongs to the user or user is admin
    const trip = await TripService.getTripById(tripId)
    if (!trip) {
      return next(new AppError("Trip not found", 404))
    }

    if (trip.user_id !== userId && req.currentUser.role !== "ADMIN") {
      return next(new AppError("You are not authorized to delete this trip", 403))
    }

    await TripService.deleteTrip(tripId)

    res.status(200).json({
      success: true,
      message: "Trip deleted successfully",
    })
  })

  static searchTrips = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 20
    const searchParams = {
      trip_type: req.query.trip_type as string,
      start_date: req.query.start_date as string,
      end_date: req.query.end_date as string,
      minPrice: req.query.minPrice ? Number.parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? Number.parseFloat(req.query.maxPrice as string) : undefined,
    }
    const sortOptions = {
      sortBy: (req.query.sortBy as string) || "price",
      sortOrder: (req.query.sortOrder as "asc" | "desc") || "asc",
    }

    const trips = await TripService.searchTrips(searchParams, page, limit, sortOptions)

    res.status(200).json({
      success: true,
      data: trips.data,
      metadata: trips.metadata,
    })
  })

  static getTripAvailability = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const tripId = req.params.id
    const startDate = req.query.startDate as string
    const endDate = req.query.endDate as string

    if (!startDate || !endDate) {
      return next(new AppError("Start date and end date are required", 400))
    }

    const availability = await TripService.getTripAvailability(tripId, startDate, endDate)

    res.status(200).json({
      success: true,
      data: availability,
    })
  })
}

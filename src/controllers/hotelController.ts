import type { Request, Response, NextFunction } from "express"
import { HotelService } from "../services/hotelService"
import { catchAsync } from "../utils/catchAsync"
import { AppError } from "../utils/appError"

export class HotelController {
  static getAllHotels = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 20
    const filters = {
      location: req.query.location as string,
      rating: req.query.rating ? Number.parseFloat(req.query.rating as string) : undefined,
      amenities: req.query.amenities ? (req.query.amenities as string).split(",") : undefined,
      minPrice: req.query.minPrice ? Number.parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? Number.parseFloat(req.query.maxPrice as string) : undefined,
    }
    const sortOptions = {
      sortBy: (req.query.sortBy as string) || "created_at",
      sortOrder: (req.query.sortOrder as "asc" | "desc") || "desc",
    }

    const hotels = await HotelService.getAllHotels(page, limit, filters, sortOptions)

    res.status(200).json({
      success: true,
      data: hotels.data,
      metadata: hotels.metadata,
    })
  })

  static getHotelById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const hotelId = req.params.id
    const hotel = await HotelService.getHotelById(hotelId)

    if (!hotel) {
      return next(new AppError("Hotel not found", 404))
    }

    res.status(200).json({
      success: true,
      data: hotel,
    })
  })

  static createHotel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const hotelData = req.body
    const hotel = await HotelService.createHotel(hotelData)

    res.status(201).json({
      success: true,
      message: "Hotel created successfully",
      data: hotel,
    })
  })

  static updateHotel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const hotelId = req.params.id
    const hotelData = req.body
    const hotel = await HotelService.updateHotel(hotelId, hotelData)

    res.status(200).json({
      success: true,
      message: "Hotel updated successfully",
      data: hotel,
    })
  })

  static deleteHotel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const hotelId = req.params.id
    await HotelService.deleteHotel(hotelId)

    res.status(200).json({
      success: true,
      message: "Hotel deleted successfully",
    })
  })

  static searchHotels = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 20
    const searchParams = {
      location: req.query.location as string,
      check_in: req.query.check_in as string,
      check_out: req.query.check_out as string,
      guests: req.query.guests ? Number.parseInt(req.query.guests as string) : undefined,
      minPrice: req.query.minPrice ? Number.parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? Number.parseFloat(req.query.maxPrice as string) : undefined,
      amenities: req.query.amenities ? (req.query.amenities as string).split(",") : undefined,
      rating: req.query.rating ? Number.parseFloat(req.query.rating as string) : undefined,
    }
    const sortOptions = {
      sortBy: (req.query.sortBy as string) || "price_per_night",
      sortOrder: (req.query.sortOrder as "asc" | "desc") || "asc",
    }

    const hotels = await HotelService.searchHotels(searchParams, page, limit, sortOptions)

    res.status(200).json({
      success: true,
      data: hotels.data,
      metadata: hotels.metadata,
    })
  })

  static getHotelAvailability = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const hotelId = req.params.id
    const startDate = req.query.startDate as string
    const endDate = req.query.endDate as string

    if (!startDate || !endDate) {
      return next(new AppError("Start date and end date are required", 400))
    }

    const availability = await HotelService.getHotelAvailability(hotelId, startDate, endDate)

    res.status(200).json({
      success: true,
      data: availability,
    })
  })
}

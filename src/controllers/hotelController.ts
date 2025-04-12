import type { Request, Response, NextFunction } from "express"
import { HotelService } from "../services/hotelService"
import { catchAsync } from "../utils/catchAsync"
import type { CreateHotelInput, UpdateHotelInput, SearchHotelsInput } from "../validators/hotelValidators"

export class HotelController {
  static createHotel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body as CreateHotelInput
    const hotel = await HotelService.createHotel(data)

    res.status(201).json({
      status: "success",
      data: hotel,
    })
  })

  static getHotels = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const hotels = await HotelService.getHotels()

    res.status(200).json({
      status: "success",
      data: hotels,
    })
  })

  static getHotelById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const hotelId = req.params.id
    const hotel = await HotelService.getHotelById(hotelId)

    res.status(200).json({
      status: "success",
      data: hotel,
    })
  })

  static updateHotel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const hotelId = req.params.id
    const data = req.body as UpdateHotelInput
    const hotel = await HotelService.updateHotel(hotelId, data)

    res.status(200).json({
      status: "success",
      data: hotel,
    })
  })

  static deleteHotel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const hotelId = req.params.id
    const result = await HotelService.deleteHotel(hotelId)

    res.status(200).json({
      status: "success",
      data: result,
    })
  })

  static searchHotels = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const params = req.query as unknown as SearchHotelsInput
    const hotels = await HotelService.searchHotels(params)

    res.status(200).json({
      status: "success",
      data: hotels,
    })
  })
}

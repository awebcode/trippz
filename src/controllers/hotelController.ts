import type { Request, Response, NextFunction } from "express";
import { HotelService } from "../services/hotelService";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/appError";

export class HotelController {
  static getAllHotels = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const hotels = await HotelService.getHotels(req.validatedQuery);

      res.status(200).json({
        success: true,
        data: hotels.data,
        metadata: hotels.metadata,
      });
    }
  );

  static getHotelById = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const hotelId = req.params.id;
      const hotel = await HotelService.getHotelById(hotelId);

      if (!hotel) {
        return next(new AppError("Hotel not found", 404));
      }

      res.status(200).json({
        success: true,
        data: hotel,
      });
    }
  );

  static createHotel = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const hotelData = req.body;
      const hotel = await HotelService.createHotel(hotelData);

      res.status(201).json({
        success: true,
        message: "Hotel created successfully",
        data: hotel,
      });
    }
  );

  static updateHotel = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const hotelId = req.params.id;
      const hotelData = req.body;
      const hotel = await HotelService.updateHotel(hotelId, hotelData);

      res.status(200).json({
        success: true,
        message: "Hotel updated successfully",
        data: hotel,
      });
    }
  );

  static deleteHotel = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const hotelId = req.params.id;
      await HotelService.deleteHotel(hotelId);

      res.status(200).json({
        success: true,
        message: "Hotel deleted successfully",
      });
    }
  );

  static searchHotels = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const hotels = await HotelService.searchHotels(req.validatedQuery);

      res.status(200).json({
        success: true,
        data: hotels.data,
        metadata: hotels.metadata,
      });
    }
  );

  static getHotelAvailability = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
     

      const availability = await HotelService.getHotelAvailability(req.validatedQuery);

      res.status(200).json({
        success: true,
        data: availability,
      });
    }
  );
}

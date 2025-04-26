import type { Request, Response } from "express";
import { HotelService } from "../services/hotelService";
import { catchAsync } from "../utils/catchAsync";
import { idParamSchema } from "../validators/commonValidators";
import type { SearchHotelsInput } from "../validators/hotelValidators";

export class HotelController {
  static createHotel = catchAsync(async (req: Request, res: Response) => {
    const hotel = await HotelService.createHotel(req.body);

    res.status(201).json({
      status: "success",
      data: {
        hotel,
      },
    });
  });

  static getHotels = catchAsync(async (req: Request, res: Response) => {
    const params = req.validatedQuery as unknown as SearchHotelsInput;
    const result = await HotelService.getHotels(params);

    res.status(200).json({
      status: "success",
      data: result.data,
      metadata: result.metadata,
    });
  });

  static getHotelById = catchAsync(async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const hotel = await HotelService.getHotelById(id);

    res.status(200).json({
      status: "success",
      data: {
        hotel,
      },
    });
  });

  static updateHotel = catchAsync(async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const hotel = await HotelService.updateHotel(id, req.body);

    res.status(200).json({
      status: "success",
      data: {
        hotel,
      },
    });
  });

  static deleteHotel = catchAsync(async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const result = await HotelService.deleteHotel(id);

    res.status(200).json({
      status: "success",
      message: result.message,
    });
  });

  static searchHotels = catchAsync(async (req: Request, res: Response) => {
    const params = req.validatedQuery as unknown as SearchHotelsInput;
    const result = await HotelService.searchHotels(params);

    res.status(200).json({
      status: "success",
      data: result.data,
      metadata: result.metadata,
    });
  });

  static getHotelAvailability = catchAsync(async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const { startDate, endDate } = req.query as { startDate: string; endDate: string };

    if (!startDate || !endDate) {
      return res.status(400).json({
        status: "error",
        message: "Start date and end date are required",
      });
    }

    const availability = await HotelService.getHotelAvailability(id, startDate, endDate);

    res.status(200).json({
      status: "success",
      data: {
        availability,
      },
    });
  });
}

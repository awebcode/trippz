import type { Request, Response } from "express";
import { TripService } from "../services/tripService";
import { catchAsync } from "../utils/catchAsync";
import { idParamSchema } from "../validators/commonValidators";
import type { SearchTripsInput } from "../validators/tripValidators";

export class TripController {
  static createTrip = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const trip = await TripService.createTrip(userId, req.body);

    res.status(201).json({
      status: "success",
      data: {
        trip,
      },
    });
  });

  static getTrips = catchAsync(async (req: Request, res: Response) => {
    const params = req.validatedQuery as unknown as SearchTripsInput;
    const result = await TripService.getTrips(params);

    res.status(200).json({
      status: "success",
      data: result.data,
      metadata: result.metadata,
    });
  });

  static getTripById = catchAsync(async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const trip = await TripService.getTripById(id);

    res.status(200).json({
      status: "success",
      data: {
        trip,
      },
    });
  });

  static updateTrip = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { id } = idParamSchema.parse(req.params);
    const trip = await TripService.updateTrip(userId, id, req.body);

    res.status(200).json({
      status: "success",
      data: {
        trip,
      },
    });
  });

  static deleteTrip = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { id } = idParamSchema.parse(req.params);
    const result = await TripService.deleteTrip(userId, id);

    res.status(200).json({
      status: "success",
      message: result.message,
    });
  });

  static searchTrips = catchAsync(async (req: Request, res: Response) => {
    const params = req.validatedQuery as unknown as SearchTripsInput;
    const result = await TripService.searchTrips(params);

    res.status(200).json({
      status: "success",
      data: result.data,
      metadata: result.metadata,
    });
  });

  static getTripAvailability = catchAsync(async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const { startDate, endDate } = req.query as { startDate: string; endDate: string };

    if (!startDate || !endDate) {
      return res.status(400).json({
        status: "error",
        message: "Start date and end date are required",
      });
    }

    const availability = await TripService.getTripAvailability(id, startDate, endDate);

    res.status(200).json({
      status: "success",
      data: {
        availability,
      },
    });
  });
}

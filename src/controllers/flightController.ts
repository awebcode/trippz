import type { Request, Response } from "express";
import { FlightService } from "../services/flightService";
import { catchAsync } from "../utils/catchAsync";
import { idParamSchema } from "../validators/commonValidators";
import type { SearchFlightsInput } from "../validators/flightValidators";

export class FlightController {
  static createFlight = catchAsync(async (req: Request, res: Response) => {
    const flight = await FlightService.createFlight(req.body);

    res.status(201).json({
      status: "success",
      data: {
        flight,
      },
    });
  });

  static getFlights = catchAsync(async (req: Request, res: Response) => {
    const params = req.validatedQuery as unknown as SearchFlightsInput;
    const result = await FlightService.getFlights(params);

    res.status(200).json({
      status: "success",
      data: result.data,
      metadata: result.metadata,
    });
  });

  static getFlightById = catchAsync(async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const flight = await FlightService.getFlightById(id);

    res.status(200).json({
      status: "success",
      data: {
        flight,
      },
    });
  });

  static updateFlight = catchAsync(async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const flight = await FlightService.updateFlight(id, req.body);

    res.status(200).json({
      status: "success",
      data: {
        flight,
      },
    });
  });

  static deleteFlight = catchAsync(async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const result = await FlightService.deleteFlight(id);

    res.status(200).json({
      status: "success",
      message: result.message,
    });
  });

  static searchFlights = catchAsync(async (req: Request, res: Response) => {
    const params = req.validatedQuery as unknown as SearchFlightsInput;
    const result = await FlightService.searchFlights(params);

    res.status(200).json({
      status: "success",
      data: result.data,
      metadata: result.metadata,
    });
  });

  static getFlightAvailability = catchAsync(async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const availability = await FlightService.getFlightAvailability(id);

    res.status(200).json({
      status: "success",
      data: {
        availability,
      },
    });
  });
}

import type { Request, Response, NextFunction } from "express";
import { FlightService } from "../services/flightService";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/appError";

export class FlightController {
  static getAllFlights = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {

      const flights = await FlightService.getFlights({...req.query,...req.validatedQuery});


      res.status(200).json({
        success: true,
        ...flights
      });
    }
  );

  static getFlightById = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const flightId = req.params.id;
      const flight = await FlightService.getFlightById(flightId);

      if (!flight) {
        return next(new AppError("Flight not found", 404));
      }

      res.status(200).json({
        success: true,
        data: flight,
      });
    }
  );

  static createFlight = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const flightData = req.body;
      const flight = await FlightService.createFlight(flightData);

      res.status(201).json({
        success: true,
        message: "Flight created successfully",
        data: flight,
      });
    }
  );

  static updateFlight = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const flightId = req.params.id;
      const flightData = req.body;
      const flight = await FlightService.updateFlight(flightId, flightData);

      res.status(200).json({
        success: true,
        message: "Flight updated successfully",
        data: flight,
      });
    }
  );

  static deleteFlight = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const flightId = req.params.id;
      await FlightService.deleteFlight(flightId);

      res.status(200).json({
        success: true,
        message: "Flight deleted successfully",
      });
    }
  );

  static searchFlights = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const flights = await FlightService.searchFlights(req.validatedQuery);

      res.status(200).json({
        success: true,
        data: flights.data,
        metadata: flights.metadata,
      });
    }
  );

  static getFlightAvailability = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const availability = await FlightService.getFlightAvailability(req.validatedQuery);

      res.status(200).json({
        success: true,
        data: availability,
      });
    }
  );
}

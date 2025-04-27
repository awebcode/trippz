import type { Request, Response, NextFunction } from "express";
import { TripService } from "../services/tripService";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/appError";

export class TripController {
  static getAllTrips = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const trips = await TripService.getTrips(req.validatedQuery);

      res.status(200).json({
        success: true,
        data: trips.data,
        metadata: trips.metadata,
      });
    }
  );

  static getTripById = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const tripId = req.params.id;
      const trip = await TripService.getTripById(tripId);

      if (!trip) {
        return next(new AppError("Trip not found", 404));
      }

      res.status(200).json({
        success: true,
        data: trip,
      });
    }
  );

  static createTrip = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = req.currentUser.id;
      const tripData = { ...req.body };
      const trip = await TripService.createTrip(userId, tripData);

      res.status(201).json({
        success: true,
        message: "Trip created successfully",
        data: trip,
      });
    }
  );

  static updateTrip = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const tripId = req.params.id;
      const userId = req.currentUser.id;
      const tripData = req.body;

      // Check if the trip belongs to the user or user is admin
      const trip = await TripService.getTripById(tripId);
      if (!trip) {
        return next(new AppError("Trip not found", 404));
      }

      if (trip.user_id !== userId && req.currentUser.role !== "ADMIN") {
        return next(new AppError("You are not authorized to update this trip", 403));
      }

      const updatedTrip = await TripService.updateTrip(userId, tripId, tripData);

      res.status(200).json({
        success: true,
        message: "Trip updated successfully",
        data: updatedTrip,
      });
    }
  );

  static deleteTrip = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const tripId = req.params.id;
      const userId = req.currentUser.id;

      // Check if the trip belongs to the user or user is admin
      const trip = await TripService.getTripById(tripId);
      if (!trip) {
        return next(new AppError("Trip not found", 404));
      }

      if (trip.user_id !== userId && req.currentUser.role !== "ADMIN") {
        return next(new AppError("You are not authorized to delete this trip", 403));
      }

      await TripService.deleteTrip(userId, tripId);

      res.status(200).json({
        success: true,
        message: "Trip deleted successfully",
      });
    }
  );

  static searchTrips = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const trips = await TripService.searchTrips(req.validatedQuery);

      res.status(200).json({
        success: true,
        data: trips.data,
        metadata: trips.metadata,
      });
    }
  );

  static getTripAvailability = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
      const availability = await TripService.getTripAvailability(req.validatedQuery);

      res.status(200).json({
        success: true,
        data: availability,
      });
    }
  );
}

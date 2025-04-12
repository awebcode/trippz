import type { Request, Response, NextFunction } from "express"
import { DestinationService } from "../services/destinationService"
import { catchAsync } from "../utils/catchAsync"
import type { DestinationInput } from "../validators/destinationValidators"
import type { Express } from "express"

export class DestinationController {
  static createDestination = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body as DestinationInput
    const files = req.files as Express.Multer.File[] | undefined
    const destination = await DestinationService.createDestination(data, files)

    res.status(201).json({
      success: true,
      message: "Destination created successfully",
      data: destination,
    })
  })

  static getDestinations = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const destinations = await DestinationService.getDestinations()

    res.status(200).json({
      success: true,
      data: destinations,
    })
  })

  static getDestinationById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const destinationId = req.params.id
    const destination = await DestinationService.getDestinationById(destinationId)

    res.status(200).json({
      success: true,
      data: destination,
    })
  })

  static updateDestination = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const destinationId = req.params.id
    const data = req.body as DestinationInput
    const files = req.files as Express.Multer.File[] | undefined
    const updatedDestination = await DestinationService.updateDestination(destinationId, data, files)

    res.status(200).json({
      success: true,
      message: "Destination updated successfully",
      data: updatedDestination,
    })
  })

  static deleteDestination = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const destinationId = req.params.id
    const result = await DestinationService.deleteDestination(destinationId)

    res.status(200).json({
      success: true,
      message: result.message,
    })
  })
}

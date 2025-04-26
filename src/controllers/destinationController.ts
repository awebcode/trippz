import type { Request, Response, NextFunction } from "express"
import { DestinationService } from "../services/destinationService"
import { catchAsync } from "../utils/catchAsync"
import type { DestinationInput, SetFeaturedImageInput } from "../validators/destinationValidators"
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
    const result = await DestinationService.getDestinations(req.query)

    res.status(200).json({
      success: true,
      data: result.data,
      metadata: result.metadata,
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

  static setFeaturedImage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const destinationId = req.params.id
    const { imageId } = req.body as SetFeaturedImageInput

    const result = await DestinationService.setFeaturedImage(destinationId, imageId)

    res.status(200).json({
      success: true,
      message: result.message,
    })
  })

  static getTrendingDestinations = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const limit = Number.parseInt(req.query.limit as string) || 5

    const destinations = await DestinationService.getTrendingDestinations(limit)

    res.status(200).json({
      success: true,
      data: destinations,
    })
  })

  static getNearbyDestinations = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { latitude, longitude, radius, limit } = req.query

    const destinations = await DestinationService.getNearbyDestinations(
      Number.parseFloat(latitude as string),
      Number.parseFloat(longitude as string),
      Number.parseInt(radius as string) || 100,
      Number.parseInt(limit as string) || 5,
    )

    res.status(200).json({
      success: true,
      data: destinations,
    })
  })

  static getDestinationWeather = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const destinationId = req.params.id

    const weather = await DestinationService.getDestinationWeather(destinationId)

    res.status(200).json({
      success: true,
      data: weather,
    })
  })

  static getDestinationAttractions = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const destinationId = req.params.id
    const limit = Number.parseInt(req.query.limit as string) || 10

    const attractions = await DestinationService.getDestinationAttractions(destinationId, limit)

    res.status(200).json({
      success: true,
      data: attractions,
    })
  })
}

import type { Request, Response, NextFunction } from "express"
import { TravelAgencyService } from "../services/travelAgencyService"
import { catchAsync } from "../utils/catchAsync"
import type {
  TravelAgencyProfileInput,
  TravelPackageInput,
  PackageResponseInput,
} from "../validators/travelAgencyValidators"
import type { Express } from "express"

export class TravelAgencyController {
  static register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const data = req.body as TravelAgencyProfileInput
    const travelAgency = await TravelAgencyService.register(userId, data)

    res.status(201).json({
      success: true,
      message: "Registered as travel agency successfully",
      data: travelAgency,
    })
  })

  static getProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const profile = await TravelAgencyService.getProfile(userId)

    res.status(200).json({
      success: true,
      data: profile,
    })
  })

  static updateProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const data = req.body as TravelAgencyProfileInput
    const updatedProfile = await TravelAgencyService.updateProfile(userId, data)

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile,
    })
  })

  static createPackage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const data = req.body as TravelPackageInput
    const files = req.files as Express.Multer.File[] | undefined
    const travelPackage = await TravelAgencyService.createPackage(userId, data, files)

    res.status(201).json({
      success: true,
      message: "Travel package created successfully",
      data: travelPackage,
    })
  })

  static getPackages = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const packages = await TravelAgencyService.getPackages(userId)

    res.status(200).json({
      success: true,
      data: packages,
    })
  })

  static getPackageById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const packageId = req.params.id
    const travelPackage = await TravelAgencyService.getPackageById(packageId)

    res.status(200).json({
      success: true,
      data: travelPackage,
    })
  })

  static updatePackage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const packageId = req.params.id
    const data = req.body as TravelPackageInput
    const files = req.files as Express.Multer.File[] | undefined
    const updatedPackage = await TravelAgencyService.updatePackage(userId, packageId, data, files)

    res.status(200).json({
      success: true,
      message: "Travel package updated successfully",
      data: updatedPackage,
    })
  })

  static deletePackage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const packageId = req.params.id
    const result = await TravelAgencyService.deletePackage(userId, packageId)

    res.status(200).json({
      success: true,
      message: result.message,
    })
  })

  static getOrders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const orders = await TravelAgencyService.getOrders(userId)

    res.status(200).json({
      success: true,
      data: orders,
    })
  })

  static respondToOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const orderId = req.params.orderId
    const data = req.body as PackageResponseInput
    const updatedOrder = await TravelAgencyService.respondToOrder(userId, orderId, data.agency_response)

    res.status(200).json({
      success: true,
      message: "Response sent successfully",
      data: updatedOrder,
    })
  })
}

import type { Request, Response, NextFunction } from "express"
import { ServiceProviderService } from "../services/serviceProviderService"
import { catchAsync } from "../utils/catchAsync"
import type {
  ServiceProviderProfileInput,
  ServiceInput,
  ServiceResponseInput,
} from "../validators/serviceProviderValidators"

export class ServiceProviderController {
  static register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const data = req.body as ServiceProviderProfileInput
    const serviceProvider = await ServiceProviderService.register(userId, data)

    res.status(201).json({
      success: true,
      message: "Registered as service provider successfully",
      data: serviceProvider,
    })
  })

  static getProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const profile = await ServiceProviderService.getProfile(userId)

    res.status(200).json({
      success: true,
      data: profile,
    })
  })

  static updateProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const data = req.body as ServiceProviderProfileInput
    const updatedProfile = await ServiceProviderService.updateProfile(userId, data)

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedProfile,
    })
  })

  static createService = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const data = req.body as ServiceInput
    const files = req.files as Express.Multer.File[] | undefined
    const service = await ServiceProviderService.createService(userId, data, files)

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: service,
    })
  })

  static getServices = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const services = await ServiceProviderService.getServices(userId)

    res.status(200).json({
      success: true,
      data: services,
    })
  })

  static getServiceById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const serviceId = req.params.id
    const service = await ServiceProviderService.getServiceById(serviceId)

    res.status(200).json({
      success: true,
      data: service,
    })
  })

  static updateService = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const serviceId = req.params.id
    const data = req.body as ServiceInput
    const files = req.files as Express.Multer.File[] | undefined
    const updatedService = await ServiceProviderService.updateService(userId, serviceId, data, files)

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: updatedService,
    })
  })

  static deleteService = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const serviceId = req.params.id
    const result = await ServiceProviderService.deleteService(userId, serviceId)

    res.status(200).json({
      success: true,
      message: result.message,
    })
  })

  static getOrders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const orders = await ServiceProviderService.getOrders(userId)

    res.status(200).json({
      success: true,
      data: orders,
    })
  })

  static respondToOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const orderId = req.params.orderId
    const data = req.body as ServiceResponseInput
    const updatedOrder = await ServiceProviderService.respondToOrder(userId, orderId, data.provider_response)

    res.status(200).json({
      success: true,
      message: "Response sent successfully",
      data: updatedOrder,
    })
  })
}

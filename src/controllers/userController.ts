import type { Request, Response, NextFunction } from "express"
import { UserService } from "../services/userService"
import { catchAsync } from "../utils/catchAsync"
import type { UpdateProfileInput, UpdatePasswordInput, AddAddressInput } from "../validators/userValidators"

export class UserController {
  static getProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const profile = await UserService.getProfile(userId)

    res.status(200).json({
      status: "success",
      data: profile,
    })
  })

  static updateProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const data = req.body as UpdateProfileInput
    const updatedProfile = await UserService.updateProfile(userId, data)

    res.status(200).json({
      status: "success",
      data: updatedProfile,
    })
  })

  static updatePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const data = req.body as UpdatePasswordInput
    const result = await UserService.updatePassword(userId, data)

    res.status(200).json({
      status: "success",
      data: result,
    })
  })

  static uploadProfilePicture = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id

    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "No file uploaded",
      })
    }

    const result = await UserService.uploadProfilePicture(userId, req.file)

    res.status(200).json({
      status: "success",
      data: result,
    })
  })

  static addAddress = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const data = req.body as AddAddressInput
    const address = await UserService.addAddress(userId, data)

    res.status(201).json({
      status: "success",
      data: address,
    })
  })

  static getAddresses = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const addresses = await UserService.getAddresses(userId)

    res.status(200).json({
      status: "success",
      data: addresses,
    })
  })

  static deleteAddress = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const addressId = req.params.id
    const result = await UserService.deleteAddress(userId, addressId)

    res.status(200).json({
      status: "success",
      data: result,
    })
  })
}

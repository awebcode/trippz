import type { Request, Response, NextFunction } from "express"
import { ReviewService } from "../services/reviewService"
import { catchAsync } from "../utils/catchAsync"
import type { CreateReviewInput, UpdateReviewInput } from "../validators/reviewValidators"

export class ReviewController {
  static createReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const data = req.body as CreateReviewInput
    const review = await ReviewService.createReview(userId, data)

    res.status(201).json({
      status: "success",
      data: review,
    })
  })

  static getHotelReviews = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const hotelId = req.params.id
    const reviews = await ReviewService.getReviews("hotel", hotelId)

    res.status(200).json({
      status: "success",
      data: reviews,
    })
  })

  static getFlightReviews = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const flightId = req.params.id
    const reviews = await ReviewService.getReviews("flight", flightId)

    res.status(200).json({
      status: "success",
      data: reviews,
    })
  })

  static getTripReviews = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const tripId = req.params.id
    const reviews = await ReviewService.getReviews("trip", tripId)

    res.status(200).json({
      status: "success",
      data: reviews,
    })
  })

  static getUserReviews = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const reviews = await ReviewService.getUserReviews(userId)

    res.status(200).json({
      status: "success",
      data: reviews,
    })
  })

  static updateReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const reviewId = req.params.id
    const data = req.body as UpdateReviewInput
    const review = await ReviewService.updateReview(userId, reviewId, data)

    res.status(200).json({
      status: "success",
      data: review,
    })
  })

  static deleteReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user!.id
    const reviewId = req.params.id
    const result = await ReviewService.deleteReview(userId, reviewId)

    res.status(200).json({
      status: "success",
      data: result,
    })
  })
}

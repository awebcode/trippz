import express from "express"
import { PaymentController } from "../controllers/paymentController"
import { protect } from "../middleware/authMiddleware"
import { validateRequest } from "../middleware/validateRequest"
import { createPaymentSchema } from "../validators/paymentValidators"

const router = express.Router()

// All routes are protected
router.use(protect)

router.post("/", validateRequest({ body: createPaymentSchema }), PaymentController.processPayment)

router.get("/", PaymentController.getPayments)

router.get("/:id", PaymentController.getPaymentById)

router.post("/:id/refund", PaymentController.refundPayment)

export { router as paymentRoutes }

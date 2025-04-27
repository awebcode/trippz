import type { Request, Response, NextFunction } from "express";
export declare class PaymentController {
    static processPayment: (req: Request, res: Response, next: NextFunction) => void;
    static getPayments: (req: Request, res: Response, next: NextFunction) => void;
    static getPaymentById: (req: Request, res: Response, next: NextFunction) => void;
    static refundPayment: (req: Request, res: Response, next: NextFunction) => void;
}
//# sourceMappingURL=paymentController.d.ts.map
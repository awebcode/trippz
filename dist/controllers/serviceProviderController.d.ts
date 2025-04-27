import type { Request, Response, NextFunction } from "express";
export declare class ServiceProviderController {
    static register: (req: Request, res: Response, next: NextFunction) => void;
    static getProfile: (req: Request, res: Response, next: NextFunction) => void;
    static updateProfile: (req: Request, res: Response, next: NextFunction) => void;
    static createService: (req: Request, res: Response, next: NextFunction) => void;
    static getServices: (req: Request, res: Response, next: NextFunction) => void;
    static getServiceById: (req: Request, res: Response, next: NextFunction) => void;
    static updateService: (req: Request, res: Response, next: NextFunction) => void;
    static deleteService: (req: Request, res: Response, next: NextFunction) => void;
    static getOrders: (req: Request, res: Response, next: NextFunction) => void;
    static respondToOrder: (req: Request, res: Response, next: NextFunction) => void;
}
//# sourceMappingURL=serviceProviderController.d.ts.map
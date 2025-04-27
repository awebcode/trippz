import type { Request, Response, NextFunction } from "express";
export declare class TravelAgencyController {
    static register: (req: Request, res: Response, next: NextFunction) => void;
    static getProfile: (req: Request, res: Response, next: NextFunction) => void;
    static updateProfile: (req: Request, res: Response, next: NextFunction) => void;
    static createPackage: (req: Request, res: Response, next: NextFunction) => void;
    static getPackages: (req: Request, res: Response, next: NextFunction) => void;
    static getPackageById: (req: Request, res: Response, next: NextFunction) => void;
    static updatePackage: (req: Request, res: Response, next: NextFunction) => void;
    static deletePackage: (req: Request, res: Response, next: NextFunction) => void;
    static getOrders: (req: Request, res: Response, next: NextFunction) => void;
    static respondToOrder: (req: Request, res: Response, next: NextFunction) => void;
}
//# sourceMappingURL=travelAgencyController.d.ts.map
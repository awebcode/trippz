import type { Request, Response, NextFunction } from "express";
export declare class TripController {
    static getAllTrips: (req: Request, res: Response, next: NextFunction) => void;
    static getTripById: (req: Request, res: Response, next: NextFunction) => void;
    static createTrip: (req: Request, res: Response, next: NextFunction) => void;
    static updateTrip: (req: Request, res: Response, next: NextFunction) => void;
    static deleteTrip: (req: Request, res: Response, next: NextFunction) => void;
    static searchTrips: (req: Request, res: Response, next: NextFunction) => void;
    static getTripAvailability: (req: Request, res: Response, next: NextFunction) => void;
}
//# sourceMappingURL=tripController.d.ts.map
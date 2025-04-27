import type { Request, Response, NextFunction } from "express";
export declare class FlightController {
    static getAllFlights: (req: Request, res: Response, next: NextFunction) => void;
    static getFlightById: (req: Request, res: Response, next: NextFunction) => void;
    static createFlight: (req: Request, res: Response, next: NextFunction) => void;
    static updateFlight: (req: Request, res: Response, next: NextFunction) => void;
    static deleteFlight: (req: Request, res: Response, next: NextFunction) => void;
    static searchFlights: (req: Request, res: Response, next: NextFunction) => void;
    static getFlightAvailability: (req: Request, res: Response, next: NextFunction) => void;
}
//# sourceMappingURL=flightController.d.ts.map
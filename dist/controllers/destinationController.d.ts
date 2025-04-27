import type { Request, Response, NextFunction } from "express";
export declare class DestinationController {
    static createDestination: (req: Request, res: Response, next: NextFunction) => void;
    static getDestinations: (req: Request, res: Response, next: NextFunction) => void;
    static getDestinationById: (req: Request, res: Response, next: NextFunction) => void;
    static updateDestination: (req: Request, res: Response, next: NextFunction) => void;
    static deleteDestination: (req: Request, res: Response, next: NextFunction) => void;
    static setFeaturedImage: (req: Request, res: Response, next: NextFunction) => void;
    static getTrendingDestinations: (req: Request, res: Response, next: NextFunction) => void;
    static getNearbyDestinations: (req: Request, res: Response, next: NextFunction) => void;
    static getDestinationWeather: (req: Request, res: Response, next: NextFunction) => void;
    static getDestinationAttractions: (req: Request, res: Response, next: NextFunction) => void;
}
//# sourceMappingURL=destinationController.d.ts.map
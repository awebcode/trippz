import type { Request, Response, NextFunction } from "express";
export declare class HotelController {
    static getAllHotels: (req: Request, res: Response, next: NextFunction) => void;
    static getHotelById: (req: Request, res: Response, next: NextFunction) => void;
    static createHotel: (req: Request, res: Response, next: NextFunction) => void;
    static updateHotel: (req: Request, res: Response, next: NextFunction) => void;
    static deleteHotel: (req: Request, res: Response, next: NextFunction) => void;
    static searchHotels: (req: Request, res: Response, next: NextFunction) => void;
    static getHotelAvailability: (req: Request, res: Response, next: NextFunction) => void;
}
//# sourceMappingURL=hotelController.d.ts.map
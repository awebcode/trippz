import type { Request, Response, NextFunction } from "express";
export declare class AdminController {
    static getUsers: (req: Request, res: Response, next: NextFunction) => void;
    static getUserById: (req: Request, res: Response, next: NextFunction) => void;
    static updateUserRole: (req: Request, res: Response, next: NextFunction) => void;
    static deleteUser: (req: Request, res: Response, next: NextFunction) => void;
    static getStats: (req: Request, res: Response, next: NextFunction) => void;
    static getAnalytics: (req: Request, res: Response, next: NextFunction) => void;
    static getSystemSettings: (req: Request, res: Response, next: NextFunction) => void;
    static updateSystemSettings: (req: Request, res: Response, next: NextFunction) => void;
    static getAllDestinations: (req: Request, res: Response, next: NextFunction) => void;
}
//# sourceMappingURL=adminController.d.ts.map
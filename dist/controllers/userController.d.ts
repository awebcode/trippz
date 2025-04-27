import type { Request, Response, NextFunction } from "express";
export declare class UserController {
    static getProfile: (req: Request, res: Response, next: NextFunction) => void;
    static updateProfile: (req: Request, res: Response, next: NextFunction) => void;
    static updatePassword: (req: Request, res: Response, next: NextFunction) => void;
    static uploadProfilePicture: (req: Request, res: Response, next: NextFunction) => void;
    static addAddress: (req: Request, res: Response, next: NextFunction) => void;
    static getAddresses: (req: Request, res: Response, next: NextFunction) => void;
    static deleteAddress: (req: Request, res: Response, next: NextFunction) => void;
}
//# sourceMappingURL=userController.d.ts.map
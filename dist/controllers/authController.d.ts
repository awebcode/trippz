import type { Request, Response, NextFunction } from "express";
export declare class AuthController {
    static register: (req: Request, res: Response, next: NextFunction) => void;
    static login: (req: Request, res: Response, next: NextFunction) => void;
    static forgotPassword: (req: Request, res: Response, next: NextFunction) => void;
    static resetPassword: (req: Request, res: Response, next: NextFunction) => void;
    static verifyEmail: (req: Request, res: Response, next: NextFunction) => void;
    static verifyPhone: (req: Request, res: Response, next: NextFunction) => void;
    static socialLogin: (req: Request, res: Response, next: NextFunction) => void;
    static logout: (req: Request, res: Response, next: NextFunction) => void;
    static logoutOtherDevices: (req: Request, res: Response, next: NextFunction) => void;
    static logoutAllDevices: (req: Request, res: Response, next: NextFunction) => void;
    static refreshToken: (req: Request, res: Response, next: NextFunction) => void;
    static socialAuthCallback: (req: Request, res: Response, next: NextFunction) => void;
}
//# sourceMappingURL=authController.d.ts.map
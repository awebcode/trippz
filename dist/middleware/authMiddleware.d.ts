import type { Request, Response, NextFunction } from "express";
declare global {
    namespace Express {
        interface Request {
            currentUser: {
                id: string;
                role: string;
                email: string;
                first_name: string;
            };
            sessionId?: string;
            validatedQuery?: any;
            user?: any;
        }
    }
}
export declare const getCookieOptions: (expires?: number) => {
    httpOnly: boolean;
    secure: boolean;
    sameSite: "strict" | "lax";
    maxAge: number;
    path: string;
};
/**
 * Auth Middleware
 * - Verifies access token from cookies or Authorization header
 * - Refreshes tokens if access token is expired using refresh token
 * - Validates session in DB
 * - Attaches user and session info to req
 */
export declare const protect: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Restrict to specific roles
 */
export declare const restrictTo: (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Optional auth middleware - doesn't require authentication but attaches user if token is valid
 */
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=authMiddleware.d.ts.map
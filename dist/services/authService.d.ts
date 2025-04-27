import { type TokenPayload } from "../utils/tokens";
import type { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput, SocialLoginInput } from "../validators/authValidators";
import type { Response } from "express";
export declare class AuthService {
    static register(data: RegisterInput): Promise<{
        user: {
            id: string;
            first_name: string;
            last_name: string | null;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    static login(data: LoginInput): Promise<{
        user: {
            id: string;
            first_name: string;
            last_name: string | null;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    static googleLogin(idToken: string): Promise<{
        user: {
            id: string;
            first_name: string;
            last_name: string | null;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    static facebookLogin(accesssToken: string): Promise<{
        user: {
            id: string;
            first_name: string;
            last_name: string | null;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    static appleLogin(idToken: string): Promise<{
        user: {
            id: string;
            first_name: string;
            last_name: string | null;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    static socialLogin(data: SocialLoginInput): Promise<{
        user: {
            id: string;
            first_name: string;
            last_name: string | null;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    static logout(userId: string, sessionId?: string, allDevices?: boolean): Promise<{
        message: string;
    }>;
    static logoutCurrentSession(userId: string, sessionId: string): Promise<{
        message: string;
    }>;
    static logoutOtherDevices(userId: string, currentSessionId: string): Promise<{
        message: string;
    }>;
    static logoutAllDevices(userId: string): Promise<{
        message: string;
    }>;
    static forgotPassword(data: ForgotPasswordInput): Promise<{
        message: string;
    }>;
    static resetPassword(data: ResetPasswordInput): Promise<{
        message: string;
    }>;
    static verifyEmail(token: string): Promise<{
        message: string;
    }>;
    static verifyPhone(code: string, userId: string): Promise<{
        message: string;
    }>;
    static resendEmailVerification(userId: string): Promise<{
        message: string;
    }>;
    static resendPhoneVerification(userId: string): Promise<{
        message: string;
    }>;
    static generateTokensForUser(userId: string, sessionId: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    static validateSession(userId: string, sessionId: string): Promise<any>;
    static generateAccessToken(user: TokenPayload): Promise<string>;
    static generateRefreshToken(user: TokenPayload): Promise<string>;
    static VerifyJwtToken(token: string, secret: string): Promise<TokenPayload>;
    static setAuthCookies(res: Response, accessToken: string, refreshToken: string): Promise<void>;
    static clearAuthCookies(res: Response): Promise<void>;
}
//# sourceMappingURL=authService.d.ts.map
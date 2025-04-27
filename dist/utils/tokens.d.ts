import type { Role } from "@prisma/client";
export declare enum TokenType {
    ACCESS = "access",
    REFRESH = "refresh",
    RESET_PASSWORD = "reset_password",
    EMAIL_VERIFICATION = "email_verification",
    PHONE_VERIFICATION = "phone_verification"
}
export interface TokenPayload {
    id: string;
    first_name: string;
    email: string;
    role: Role;
    [key: string]: any;
}
export declare const generateToken: (payload: Omit<TokenPayload, "type">, type: TokenType, expiresIn?: string) => string;
export declare function verifyToken<T extends TokenPayload>(token: string, type: TokenType): T;
export declare const getSecretForTokenType: (type: TokenType) => string;
export declare const generateAuthTokens: (userId: string, sessionId: string) => Promise<{
    accessToken: string;
    refreshToken: string;
}>;
export declare const revokeRefreshToken: (userId: string) => Promise<void>;
export declare const generateVerificationToken: () => string;
export declare const generateResetPasswordToken: (userId: string) => string;
export declare const generatePhoneVerificationCode: () => string;
//# sourceMappingURL=tokens.d.ts.map
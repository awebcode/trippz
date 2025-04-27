export declare const config: {
    server: {
        port: number;
        nodeEnv: string;
    };
    apiUrl: string;
    database: {
        url: string;
    };
    jwt: {
        secret: string;
        accessExpiresIn: string;
        refreshSecret: string;
        refreshExpiresIn: string;
        resetPasswordSecret: string;
        emailVerificationSecret: string;
        phoneVerificationSecret: string;
    };
    auth: {
        useCookieAuth: boolean;
    };
    resend: {
        apiKey: string;
        receiverEmail: string;
        fromEmail: string;
    };
    frontendUrl: string;
    cloudinary: {
        cloudName: string;
        apiKey: string;
        apiSecret: string;
    };
    twilio: {
        accountSid: string;
        authToken: string;
        phoneNumber: string;
    };
    stripe: {
        secretKey: string;
    };
    oauth: {
        google: {
            clientId: string;
            clientSecret: string;
        };
        facebook: {
            appId: string;
            appSecret: string;
        };
        apple: {
            clientId: string;
            clientSecret: string;
            keyId: string;
            teamId: string;
        };
    };
};
//# sourceMappingURL=index.d.ts.map
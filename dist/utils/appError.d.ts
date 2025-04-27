export declare class AppError extends Error {
    statusCode: number;
    status: string;
    isOperational: boolean;
    errors: {
        path: string;
        message: string;
    }[];
    constructor(message: string, statusCode: number, errors?: {
        path: string;
        message: string;
    }[]);
}
//# sourceMappingURL=appError.d.ts.map
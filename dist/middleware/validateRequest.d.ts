import type { Request, Response, NextFunction } from "express";
import { type AnyZodObject, type ZodType } from "zod";
interface ValidatedRequest<TQuery = any, TBody = any, TParams = any> extends Request {
    validatedQuery?: TQuery;
    validatedBody?: TBody;
    validatedParams?: TParams;
}
export declare const validateRequest: <TBody, TQuery, TParams>(schema: {
    body?: AnyZodObject | ZodType;
    query?: AnyZodObject | ZodType;
    params?: AnyZodObject | ZodType;
}) => (req: ValidatedRequest<TQuery, TBody, TParams>, res: Response, next: NextFunction) => Promise<void>;
export {};
//# sourceMappingURL=validateRequest.d.ts.map
import { z } from "zod";
export declare const idParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const paginationQuerySchema: z.ZodObject<{
    page: z.ZodPipeline<z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>, z.ZodDefault<z.ZodNumber>>;
    limit: z.ZodPipeline<z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>, z.ZodDefault<z.ZodNumber>>;
    sortBy: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
}, {
    limit?: string | undefined;
    page?: string | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export declare const searchQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    search?: string | undefined;
}, {
    search?: string | undefined;
}>;
export declare const dateRangeQuerySchema: z.ZodObject<{
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    startDate?: string | undefined;
    endDate?: string | undefined;
}>;
export declare const priceRangeQuerySchema: z.ZodObject<{
    minPrice: z.ZodEffects<z.ZodOptional<z.ZodString>, number | undefined, string | undefined>;
    maxPrice: z.ZodEffects<z.ZodOptional<z.ZodString>, number | undefined, string | undefined>;
}, "strip", z.ZodTypeAny, {
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
}, {
    minPrice?: string | undefined;
    maxPrice?: string | undefined;
}>;
export declare const commonQuerySchema: z.ZodObject<z.objectUtil.extendShape<{
    page: z.ZodPipeline<z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>, z.ZodDefault<z.ZodNumber>>;
    limit: z.ZodPipeline<z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>, z.ZodDefault<z.ZodNumber>>;
    sortBy: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
}, {
    search: z.ZodOptional<z.ZodString>;
}>, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
    search?: string | undefined;
}, {
    search?: string | undefined;
    limit?: string | undefined;
    page?: string | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export type IdParam = z.infer<typeof idParamSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export type DateRangeQuery = z.infer<typeof dateRangeQuerySchema>;
export type PriceRangeQuery = z.infer<typeof priceRangeQuerySchema>;
export type CommonQuery = z.infer<typeof commonQuerySchema>;
export interface PaginatedResult<T> {
    data: T[];
    metadata: {
        totalCount: number;
        filteredCount: number;
        totalPages: number;
        currentPage: number;
        limit: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}
//# sourceMappingURL=commonValidators.d.ts.map
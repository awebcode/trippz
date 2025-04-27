import { z } from "zod";
export declare const createReviewSchema: z.ZodEffects<z.ZodObject<{
    hotel_id: z.ZodOptional<z.ZodString>;
    flight_id: z.ZodOptional<z.ZodString>;
    trip_id: z.ZodOptional<z.ZodString>;
    rating: z.ZodNumber;
    comment: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    rating: number;
    hotel_id?: string | undefined;
    flight_id?: string | undefined;
    trip_id?: string | undefined;
    comment?: string | undefined;
}, {
    rating: number;
    hotel_id?: string | undefined;
    flight_id?: string | undefined;
    trip_id?: string | undefined;
    comment?: string | undefined;
}>, {
    rating: number;
    hotel_id?: string | undefined;
    flight_id?: string | undefined;
    trip_id?: string | undefined;
    comment?: string | undefined;
}, {
    rating: number;
    hotel_id?: string | undefined;
    flight_id?: string | undefined;
    trip_id?: string | undefined;
    comment?: string | undefined;
}>;
export declare const updateReviewSchema: z.ZodObject<{
    rating: z.ZodOptional<z.ZodNumber>;
    comment: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    rating?: number | undefined;
    comment?: string | undefined;
}, {
    rating?: number | undefined;
    comment?: string | undefined;
}>;
export declare const reviewListQuerySchema: z.ZodObject<z.objectUtil.extendShape<{
    page: z.ZodPipeline<z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>, z.ZodDefault<z.ZodNumber>>;
    limit: z.ZodPipeline<z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>, z.ZodDefault<z.ZodNumber>>;
    sortBy: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
}, {
    rating: z.ZodOptional<z.ZodNumber>;
    entityType: z.ZodOptional<z.ZodEnum<["hotel", "flight", "trip"]>>;
}>, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
    rating?: number | undefined;
    entityType?: "hotel" | "flight" | "trip" | undefined;
}, {
    limit?: string | undefined;
    rating?: number | undefined;
    page?: string | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    entityType?: "hotel" | "flight" | "trip" | undefined;
}>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type ReviewListQuery = z.infer<typeof reviewListQuerySchema>;
//# sourceMappingURL=reviewValidators.d.ts.map
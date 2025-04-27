import { z } from "zod";
export declare const userQuerySchema: z.ZodObject<z.objectUtil.extendShape<z.objectUtil.extendShape<{
    page: z.ZodPipeline<z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>, z.ZodDefault<z.ZodNumber>>;
    limit: z.ZodPipeline<z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>, z.ZodDefault<z.ZodNumber>>;
    sortBy: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
}, {
    search: z.ZodOptional<z.ZodString>;
}>, {
    role: z.ZodOptional<z.ZodEnum<["USER", "SERVICE_PROVIDER", "TRAVEL_AGENCY", "ADMIN"]>>;
    emailVerified: z.ZodEffects<z.ZodOptional<z.ZodString>, boolean | undefined, string | undefined>;
    phoneVerified: z.ZodEffects<z.ZodOptional<z.ZodString>, boolean | undefined, string | undefined>;
}>, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
    search?: string | undefined;
    role?: "USER" | "SERVICE_PROVIDER" | "ADMIN" | "TRAVEL_AGENCY" | undefined;
    emailVerified?: boolean | undefined;
    phoneVerified?: boolean | undefined;
}, {
    search?: string | undefined;
    role?: "USER" | "SERVICE_PROVIDER" | "ADMIN" | "TRAVEL_AGENCY" | undefined;
    limit?: string | undefined;
    page?: string | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    emailVerified?: string | undefined;
    phoneVerified?: string | undefined;
}>;
export declare const updateUserRoleSchema: z.ZodObject<{
    role: z.ZodEnum<["USER", "SERVICE_PROVIDER", "TRAVEL_AGENCY", "ADMIN"]>;
}, "strict", z.ZodTypeAny, {
    role: "USER" | "SERVICE_PROVIDER" | "ADMIN" | "TRAVEL_AGENCY";
}, {
    role: "USER" | "SERVICE_PROVIDER" | "ADMIN" | "TRAVEL_AGENCY";
}>;
export declare const analyticsQuerySchema: z.ZodObject<{
    period: z.ZodDefault<z.ZodEnum<["daily", "weekly", "monthly", "yearly"]>>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    period: "daily" | "weekly" | "monthly" | "yearly";
    startDate?: string | undefined;
    endDate?: string | undefined;
}, {
    startDate?: string | undefined;
    endDate?: string | undefined;
    period?: "daily" | "weekly" | "monthly" | "yearly" | undefined;
}>;
export declare const systemSettingsSchema: z.ZodObject<{
    maintenance_mode: z.ZodBoolean;
    booking_fee_percentage: z.ZodNumber;
    default_currency: z.ZodString;
    support_email: z.ZodString;
    support_phone: z.ZodString;
    terms_url: z.ZodString;
    privacy_url: z.ZodString;
}, "strict", z.ZodTypeAny, {
    maintenance_mode: boolean;
    booking_fee_percentage: number;
    default_currency: string;
    support_email: string;
    support_phone: string;
    terms_url: string;
    privacy_url: string;
}, {
    maintenance_mode: boolean;
    booking_fee_percentage: number;
    default_currency: string;
    support_email: string;
    support_phone: string;
    terms_url: string;
    privacy_url: string;
}>;
export type UserQuery = z.infer<typeof userQuerySchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
export type SystemSettingsInput = z.infer<typeof systemSettingsSchema>;
//# sourceMappingURL=adminValidators.d.ts.map
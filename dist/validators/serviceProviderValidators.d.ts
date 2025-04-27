import { z } from "zod";
export declare const serviceProviderProfileSchema: z.ZodObject<{
    business_name: z.ZodString;
    business_address: z.ZodOptional<z.ZodString>;
    business_phone: z.ZodOptional<z.ZodString>;
    business_email: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    business_name: string;
    description?: string | undefined;
    business_address?: string | undefined;
    business_phone?: string | undefined;
    business_email?: string | undefined;
    website?: string | undefined;
}, {
    business_name: string;
    description?: string | undefined;
    business_address?: string | undefined;
    business_phone?: string | undefined;
    business_email?: string | undefined;
    website?: string | undefined;
}>;
export declare const serviceSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    price: z.ZodNumber;
    duration: z.ZodNumber;
    location: z.ZodOptional<z.ZodString>;
    category: z.ZodString;
    availability: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    max_participants: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    price: number;
    duration: number;
    category: string;
    location?: string | undefined;
    max_participants?: number | undefined;
    availability?: Record<string, any> | undefined;
}, {
    name: string;
    description: string;
    price: number;
    duration: number;
    category: string;
    location?: string | undefined;
    max_participants?: number | undefined;
    availability?: Record<string, any> | undefined;
}>;
export declare const serviceResponseSchema: z.ZodObject<{
    provider_response: z.ZodString;
}, "strip", z.ZodTypeAny, {
    provider_response: string;
}, {
    provider_response: string;
}>;
export type ServiceProviderProfileInput = z.infer<typeof serviceProviderProfileSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type ServiceResponseInput = z.infer<typeof serviceResponseSchema>;
//# sourceMappingURL=serviceProviderValidators.d.ts.map
import { z } from "zod";
export declare const travelAgencyProfileSchema: z.ZodObject<{
    agency_name: z.ZodString;
    agency_address: z.ZodOptional<z.ZodString>;
    agency_phone: z.ZodOptional<z.ZodString>;
    agency_email: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    agency_name: string;
    description?: string | undefined;
    website?: string | undefined;
    agency_address?: string | undefined;
    agency_phone?: string | undefined;
    agency_email?: string | undefined;
}, {
    agency_name: string;
    description?: string | undefined;
    website?: string | undefined;
    agency_address?: string | undefined;
    agency_phone?: string | undefined;
    agency_email?: string | undefined;
}>;
export declare const travelPackageSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    price: z.ZodNumber;
    duration: z.ZodNumber;
    destination_ids: z.ZodArray<z.ZodString, "many">;
    inclusions: z.ZodArray<z.ZodString, "many">;
    exclusions: z.ZodArray<z.ZodString, "many">;
    itinerary: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    max_travelers: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    price: number;
    destination_ids: string[];
    inclusions: string[];
    exclusions: string[];
    duration: number;
    itinerary?: Record<string, any> | undefined;
    max_travelers?: number | undefined;
}, {
    name: string;
    description: string;
    price: number;
    destination_ids: string[];
    inclusions: string[];
    exclusions: string[];
    duration: number;
    itinerary?: Record<string, any> | undefined;
    max_travelers?: number | undefined;
}>;
export declare const packageResponseSchema: z.ZodObject<{
    agency_response: z.ZodString;
}, "strip", z.ZodTypeAny, {
    agency_response: string;
}, {
    agency_response: string;
}>;
export type TravelAgencyProfileInput = z.infer<typeof travelAgencyProfileSchema>;
export type TravelPackageInput = z.infer<typeof travelPackageSchema>;
export type PackageResponseInput = z.infer<typeof packageResponseSchema>;
//# sourceMappingURL=travelAgencyValidators.d.ts.map
import { z } from "zod";
export declare const destinationSchema: z.ZodObject<{
    name: z.ZodString;
    country: z.ZodString;
    city: z.ZodOptional<z.ZodString>;
    description: z.ZodString;
    highlights: z.ZodArray<z.ZodString, "many">;
    best_time_to_visit: z.ZodOptional<z.ZodString>;
    travel_tips: z.ZodArray<z.ZodString, "many">;
    latitude: z.ZodOptional<z.ZodNumber>;
    longitude: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodOptional<z.ZodString>;
    language: z.ZodOptional<z.ZodString>;
    timezone: z.ZodOptional<z.ZodString>;
    safety_index: z.ZodOptional<z.ZodNumber>;
    cost_index: z.ZodOptional<z.ZodNumber>;
    featured: z.ZodOptional<z.ZodBoolean>;
    meta_title: z.ZodOptional<z.ZodString>;
    meta_description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    country: string;
    description: string;
    highlights: string[];
    travel_tips: string[];
    language?: string | undefined;
    city?: string | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
    currency?: string | undefined;
    timezone?: string | undefined;
    safety_index?: number | undefined;
    cost_index?: number | undefined;
    featured?: boolean | undefined;
    meta_title?: string | undefined;
    meta_description?: string | undefined;
    best_time_to_visit?: string | undefined;
}, {
    name: string;
    country: string;
    description: string;
    highlights: string[];
    travel_tips: string[];
    language?: string | undefined;
    city?: string | undefined;
    latitude?: number | undefined;
    longitude?: number | undefined;
    currency?: string | undefined;
    timezone?: string | undefined;
    safety_index?: number | undefined;
    cost_index?: number | undefined;
    featured?: boolean | undefined;
    meta_title?: string | undefined;
    meta_description?: string | undefined;
    best_time_to_visit?: string | undefined;
}>;
export declare const setFeaturedImageSchema: z.ZodObject<{
    imageId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    imageId: string;
}, {
    imageId: string;
}>;
export type DestinationInput = z.infer<typeof destinationSchema>;
export type SetFeaturedImageInput = z.infer<typeof setFeaturedImageSchema>;
//# sourceMappingURL=destinationValidators.d.ts.map
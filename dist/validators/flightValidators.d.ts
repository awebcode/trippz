import { z } from "zod";
export declare const createFlightSchema: z.ZodObject<{
    flight_number: z.ZodString;
    airline: z.ZodString;
    departure_time: z.ZodEffects<z.ZodString, string, string>;
    arrival_time: z.ZodEffects<z.ZodString, string, string>;
    from_airport: z.ZodString;
    to_airport: z.ZodString;
    price: z.ZodNumber;
    seat_class: z.ZodString;
    available_seats: z.ZodOptional<z.ZodNumber>;
    aircraft_type: z.ZodOptional<z.ZodString>;
    has_wifi: z.ZodOptional<z.ZodBoolean>;
    has_entertainment: z.ZodOptional<z.ZodBoolean>;
    has_power_outlets: z.ZodOptional<z.ZodBoolean>;
    meal_service: z.ZodOptional<z.ZodBoolean>;
    baggage_allowance: z.ZodOptional<z.ZodNumber>;
    cancellation_policy: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    flight_number: string;
    airline: string;
    departure_time: string;
    arrival_time: string;
    from_airport: string;
    to_airport: string;
    price: number;
    seat_class: string;
    cancellation_policy?: string | undefined;
    has_wifi?: boolean | undefined;
    available_seats?: number | undefined;
    aircraft_type?: string | undefined;
    has_entertainment?: boolean | undefined;
    has_power_outlets?: boolean | undefined;
    meal_service?: boolean | undefined;
    baggage_allowance?: number | undefined;
}, {
    flight_number: string;
    airline: string;
    departure_time: string;
    arrival_time: string;
    from_airport: string;
    to_airport: string;
    price: number;
    seat_class: string;
    cancellation_policy?: string | undefined;
    has_wifi?: boolean | undefined;
    available_seats?: number | undefined;
    aircraft_type?: string | undefined;
    has_entertainment?: boolean | undefined;
    has_power_outlets?: boolean | undefined;
    meal_service?: boolean | undefined;
    baggage_allowance?: number | undefined;
}>;
export declare const updateFlightSchema: z.ZodObject<{
    flight_number: z.ZodOptional<z.ZodString>;
    airline: z.ZodOptional<z.ZodString>;
    departure_time: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    arrival_time: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    from_airport: z.ZodOptional<z.ZodString>;
    to_airport: z.ZodOptional<z.ZodString>;
    price: z.ZodOptional<z.ZodNumber>;
    seat_class: z.ZodOptional<z.ZodString>;
    available_seats: z.ZodOptional<z.ZodNumber>;
    aircraft_type: z.ZodOptional<z.ZodString>;
    has_wifi: z.ZodOptional<z.ZodBoolean>;
    has_entertainment: z.ZodOptional<z.ZodBoolean>;
    has_power_outlets: z.ZodOptional<z.ZodBoolean>;
    meal_service: z.ZodOptional<z.ZodBoolean>;
    baggage_allowance: z.ZodOptional<z.ZodNumber>;
    cancellation_policy: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    cancellation_policy?: string | undefined;
    has_wifi?: boolean | undefined;
    flight_number?: string | undefined;
    airline?: string | undefined;
    departure_time?: string | undefined;
    arrival_time?: string | undefined;
    from_airport?: string | undefined;
    to_airport?: string | undefined;
    price?: number | undefined;
    seat_class?: string | undefined;
    available_seats?: number | undefined;
    aircraft_type?: string | undefined;
    has_entertainment?: boolean | undefined;
    has_power_outlets?: boolean | undefined;
    meal_service?: boolean | undefined;
    baggage_allowance?: number | undefined;
}, {
    cancellation_policy?: string | undefined;
    has_wifi?: boolean | undefined;
    flight_number?: string | undefined;
    airline?: string | undefined;
    departure_time?: string | undefined;
    arrival_time?: string | undefined;
    from_airport?: string | undefined;
    to_airport?: string | undefined;
    price?: number | undefined;
    seat_class?: string | undefined;
    available_seats?: number | undefined;
    aircraft_type?: string | undefined;
    has_entertainment?: boolean | undefined;
    has_power_outlets?: boolean | undefined;
    meal_service?: boolean | undefined;
    baggage_allowance?: number | undefined;
}>;
export declare const searchFlightsSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    sortBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<["departure_time", "arrival_time", "price", "airline", "created_at"]>>>;
    sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
    from: z.ZodOptional<z.ZodString>;
    to: z.ZodOptional<z.ZodString>;
    departure_date: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    return_date: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    seat_class: z.ZodOptional<z.ZodString>;
    minPrice: z.ZodOptional<z.ZodNumber>;
    maxPrice: z.ZodOptional<z.ZodNumber>;
    airline: z.ZodOptional<z.ZodString>;
    direct_flights_only: z.ZodOptional<z.ZodBoolean>;
    has_wifi: z.ZodOptional<z.ZodBoolean>;
    has_entertainment: z.ZodOptional<z.ZodBoolean>;
    has_power_outlets: z.ZodOptional<z.ZodBoolean>;
    meal_service: z.ZodOptional<z.ZodBoolean>;
    min_baggage_allowance: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: "created_at" | "airline" | "departure_time" | "arrival_time" | "price";
    sortOrder: "asc" | "desc";
    from?: string | undefined;
    to?: string | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    has_wifi?: boolean | undefined;
    airline?: string | undefined;
    seat_class?: string | undefined;
    has_entertainment?: boolean | undefined;
    has_power_outlets?: boolean | undefined;
    meal_service?: boolean | undefined;
    departure_date?: string | undefined;
    return_date?: string | undefined;
    direct_flights_only?: boolean | undefined;
    min_baggage_allowance?: number | undefined;
}, {
    from?: string | undefined;
    to?: string | undefined;
    limit?: number | undefined;
    page?: number | undefined;
    sortBy?: "created_at" | "airline" | "departure_time" | "arrival_time" | "price" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    minPrice?: number | undefined;
    maxPrice?: number | undefined;
    has_wifi?: boolean | undefined;
    airline?: string | undefined;
    seat_class?: string | undefined;
    has_entertainment?: boolean | undefined;
    has_power_outlets?: boolean | undefined;
    meal_service?: boolean | undefined;
    departure_date?: string | undefined;
    return_date?: string | undefined;
    direct_flights_only?: boolean | undefined;
    min_baggage_allowance?: number | undefined;
}>;
export declare const flightAvailabilitySchema: z.ZodObject<{
    flight_id: z.ZodString;
    date: z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
    passengers: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    flight_id: string;
    passengers: number;
    date?: string | undefined;
}, {
    flight_id: string;
    date?: string | undefined;
    passengers?: number | undefined;
}>;
export type CreateFlightInput = z.infer<typeof createFlightSchema>;
export type UpdateFlightInput = z.infer<typeof updateFlightSchema>;
export type SearchFlightsInput = z.infer<typeof searchFlightsSchema>;
export type FlightAvailabilityInput = z.infer<typeof flightAvailabilitySchema>;
//# sourceMappingURL=flightValidators.d.ts.map
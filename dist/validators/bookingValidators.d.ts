import { z } from "zod";
export declare const createBookingSchema: z.ZodEffects<z.ZodObject<{
    booking_type: z.ZodEnum<["FLIGHT", "HOTEL", "TRIP"]>;
    start_date: z.ZodString;
    end_date: z.ZodString;
    flight_id: z.ZodOptional<z.ZodString>;
    hotel_id: z.ZodOptional<z.ZodString>;
    trip_id: z.ZodOptional<z.ZodString>;
    guests: z.ZodOptional<z.ZodNumber>;
    special_requests: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    end_date: string;
    start_date: string;
    booking_type: "FLIGHT" | "HOTEL" | "TRIP";
    guests?: number | undefined;
    hotel_id?: string | undefined;
    flight_id?: string | undefined;
    trip_id?: string | undefined;
    special_requests?: string | undefined;
}, {
    end_date: string;
    start_date: string;
    booking_type: "FLIGHT" | "HOTEL" | "TRIP";
    guests?: number | undefined;
    hotel_id?: string | undefined;
    flight_id?: string | undefined;
    trip_id?: string | undefined;
    special_requests?: string | undefined;
}>, {
    end_date: string;
    start_date: string;
    booking_type: "FLIGHT" | "HOTEL" | "TRIP";
    guests?: number | undefined;
    hotel_id?: string | undefined;
    flight_id?: string | undefined;
    trip_id?: string | undefined;
    special_requests?: string | undefined;
}, {
    end_date: string;
    start_date: string;
    booking_type: "FLIGHT" | "HOTEL" | "TRIP";
    guests?: number | undefined;
    hotel_id?: string | undefined;
    flight_id?: string | undefined;
    trip_id?: string | undefined;
    special_requests?: string | undefined;
}>;
export declare const updateBookingSchema: z.ZodObject<{
    start_date: z.ZodOptional<z.ZodString>;
    end_date: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["PENDING", "CONFIRMED", "CANCELED", "COMPLETED"]>>;
    guests: z.ZodOptional<z.ZodNumber>;
    special_requests: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    status?: "CONFIRMED" | "PENDING" | "CANCELED" | "COMPLETED" | undefined;
    guests?: number | undefined;
    end_date?: string | undefined;
    start_date?: string | undefined;
    special_requests?: string | undefined;
}, {
    status?: "CONFIRMED" | "PENDING" | "CANCELED" | "COMPLETED" | undefined;
    guests?: number | undefined;
    end_date?: string | undefined;
    start_date?: string | undefined;
    special_requests?: string | undefined;
}>;
export declare const bookingListQuerySchema: z.ZodObject<z.objectUtil.extendShape<{
    page: z.ZodPipeline<z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>, z.ZodDefault<z.ZodNumber>>;
    limit: z.ZodPipeline<z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>, z.ZodDefault<z.ZodNumber>>;
    sortBy: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
}, {
    status: z.ZodOptional<z.ZodEnum<["PENDING", "CONFIRMED", "CANCELED", "COMPLETED"]>>;
    booking_type: z.ZodOptional<z.ZodEnum<["FLIGHT", "HOTEL", "TRIP"]>>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
}>, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
    status?: "CONFIRMED" | "PENDING" | "CANCELED" | "COMPLETED" | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    booking_type?: "FLIGHT" | "HOTEL" | "TRIP" | undefined;
}, {
    limit?: string | undefined;
    status?: "CONFIRMED" | "PENDING" | "CANCELED" | "COMPLETED" | undefined;
    page?: string | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    booking_type?: "FLIGHT" | "HOTEL" | "TRIP" | undefined;
}>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type BookingListQuery = z.infer<typeof bookingListQuerySchema>;
//# sourceMappingURL=bookingValidators.d.ts.map
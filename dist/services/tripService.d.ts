import type { CreateTripInput, UpdateTripInput, SearchTripsInput, TripAvailabilityInput } from "../validators/tripValidators";
import type { PaginatedResult } from "../validators/commonValidators";
export declare class TripService {
    static createTrip(userId: string, data: CreateTripInput): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        theme: string | null;
        user_id: string;
        description: string;
        cancellation_policy: string | null;
        is_family_friendly: boolean | null;
        end_date: Date;
        start_date: Date;
        price: number;
        trip_name: string;
        trip_type: import("@prisma/client").$Enums.TripType;
        max_participants: number | null;
        itinerary: import("@prisma/client/runtime/library").JsonValue | null;
        inclusions: string[];
        exclusions: string[];
        includes_flight: boolean | null;
        includes_hotel: boolean | null;
        includes_activities: boolean | null;
        includes_meals: boolean | null;
        is_guided: boolean | null;
        is_accessible: boolean | null;
        difficulty_level: string | null;
        travel_style: string | null;
    }>;
    static getTrips(params: SearchTripsInput): Promise<PaginatedResult<any>>;
    static getTripById(id: string): Promise<{
        avg_rating: number;
        review_count: number;
        duration_days: number;
        booked_dates: {
            start: Date;
            end: Date;
        }[];
        destinations: {
            id: string;
            name: string;
            country: string;
            description: string;
            image_url: string | null;
        }[];
        tripDestinations: undefined;
        bookings: undefined;
        user: {
            id: string;
            first_name: string;
            last_name: string | null;
            profile_picture: string | null;
        };
        images: {
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string | null;
            hotel_id: string | null;
            trip_id: string | null;
            file_url: string;
            file_type: string;
            is_featured: boolean | null;
            alt_text: string | null;
            flightId: string | null;
            service_id: string | null;
            package_id: string | null;
            destination_id: string | null;
            position: number | null;
        }[];
        reviews: ({
            user: {
                id: string;
                first_name: string;
                last_name: string | null;
                profile_picture: string | null;
            };
        } & {
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            rating: number;
            hotel_id: string | null;
            flight_id: string | null;
            trip_id: string | null;
            comment: string | null;
        })[];
        id: string;
        created_at: Date;
        updated_at: Date;
        theme: string | null;
        user_id: string;
        description: string;
        cancellation_policy: string | null;
        is_family_friendly: boolean | null;
        end_date: Date;
        start_date: Date;
        price: number;
        trip_name: string;
        trip_type: import("@prisma/client").$Enums.TripType;
        max_participants: number | null;
        itinerary: import("@prisma/client/runtime/library").JsonValue | null;
        inclusions: string[];
        exclusions: string[];
        includes_flight: boolean | null;
        includes_hotel: boolean | null;
        includes_activities: boolean | null;
        includes_meals: boolean | null;
        is_guided: boolean | null;
        is_accessible: boolean | null;
        difficulty_level: string | null;
        travel_style: string | null;
    }>;
    static updateTrip(userId: string, id: string, data: UpdateTripInput): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        theme: string | null;
        user_id: string;
        description: string;
        cancellation_policy: string | null;
        is_family_friendly: boolean | null;
        end_date: Date;
        start_date: Date;
        price: number;
        trip_name: string;
        trip_type: import("@prisma/client").$Enums.TripType;
        max_participants: number | null;
        itinerary: import("@prisma/client/runtime/library").JsonValue | null;
        inclusions: string[];
        exclusions: string[];
        includes_flight: boolean | null;
        includes_hotel: boolean | null;
        includes_activities: boolean | null;
        includes_meals: boolean | null;
        is_guided: boolean | null;
        is_accessible: boolean | null;
        difficulty_level: string | null;
        travel_style: string | null;
    }>;
    static deleteTrip(userId: string, id: string): Promise<{
        message: string;
    }>;
    static searchTrips(params: SearchTripsInput): Promise<PaginatedResult<any>>;
    static getTripAvailability(params: TripAvailabilityInput): Promise<{
        trip_id: string;
        trip_name: string;
        trip_type: import("@prisma/client").$Enums.TripType;
        max_participants: number;
        booked_participants: number;
        available_spots: number;
        requested_participants: number;
        is_available: boolean;
        requested_period: {
            start_date: string;
            end_date: string;
        };
    }>;
    static customTripQuery(params: any): Promise<PaginatedResult<any>>;
}
//# sourceMappingURL=tripService.d.ts.map
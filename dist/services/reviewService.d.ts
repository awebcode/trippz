import type { CreateReviewInput, UpdateReviewInput } from "../validators/reviewValidators";
export declare class ReviewService {
    static createReview(userId: string, data: CreateReviewInput): Promise<{
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
    }>;
    static getReviews(entityType: "hotel" | "flight" | "trip", entityId: string): Promise<({
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
    })[]>;
    static getUserReviews(userId: string): Promise<({
        hotel: {
            id: string;
            created_at: Date;
            updated_at: Date;
            name: string;
            address: string;
            rating: number;
            price_per_night: number;
            amenities: string[];
            available_rooms: number;
            description: string | null;
            check_in_time: string | null;
            check_out_time: string | null;
            location: import("@prisma/client/runtime/library").JsonValue | null;
            cancellation_policy: string | null;
            distance_from_center: number | null;
            has_free_cancellation: boolean | null;
            has_breakfast_included: boolean | null;
            has_parking: boolean | null;
            has_pool: boolean | null;
            has_gym: boolean | null;
            has_restaurant: boolean | null;
            has_room_service: boolean | null;
            has_spa: boolean | null;
            has_wifi: boolean | null;
            has_air_conditioning: boolean | null;
            is_pet_friendly: boolean | null;
            is_family_friendly: boolean | null;
            property_type: string | null;
            star_rating: number | null;
        } | null;
        flight: {
            id: string;
            created_at: Date;
            updated_at: Date;
            cancellation_policy: string | null;
            has_wifi: boolean | null;
            flight_number: string;
            airline: string;
            departure_time: Date;
            arrival_time: Date;
            from_airport: string;
            to_airport: string;
            price: number;
            seat_class: string;
            available_seats: number | null;
            aircraft_type: string | null;
            has_entertainment: boolean | null;
            has_power_outlets: boolean | null;
            meal_service: boolean | null;
            baggage_allowance: number | null;
        } | null;
        trip: {
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
        } | null;
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
    })[]>;
    static updateReview(userId: string, reviewId: string, data: UpdateReviewInput): Promise<{
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
    }>;
    static deleteReview(userId: string, reviewId: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=reviewService.d.ts.map
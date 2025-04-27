import type { DestinationInput } from "../validators/destinationValidators";
export declare class DestinationService {
    static createDestination(data: DestinationInput, files?: Express.Multer.File[]): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        name: string;
        language: string | null;
        city: string | null;
        country: string;
        description: string;
        latitude: number | null;
        longitude: number | null;
        activities: string[];
        currency: string | null;
        timezone: string | null;
        safety_index: number | null;
        cost_index: number | null;
        featured: boolean | null;
        meta_title: string | null;
        meta_description: string | null;
        highlights: string[];
        best_time_to_visit: string | null;
        travel_tips: string[];
        image_url: string | null;
    }>;
    static getDestinations(query?: any): Promise<{
        data: ({
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
        } & {
            id: string;
            created_at: Date;
            updated_at: Date;
            name: string;
            language: string | null;
            city: string | null;
            country: string;
            description: string;
            latitude: number | null;
            longitude: number | null;
            activities: string[];
            currency: string | null;
            timezone: string | null;
            safety_index: number | null;
            cost_index: number | null;
            featured: boolean | null;
            meta_title: string | null;
            meta_description: string | null;
            highlights: string[];
            best_time_to_visit: string | null;
            travel_tips: string[];
            image_url: string | null;
        })[];
        metadata: {
            totalCount: number;
            totalPages: number;
            currentPage: number;
            limit: number;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }>;
    static getDestinationById(id: string): Promise<{
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
        packages: ({
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
            agency: {
                id: string;
                created_at: Date;
                updated_at: Date;
                user_id: string;
                rating: number;
                description: string | null;
                website: string | null;
                verified: boolean;
                agency_name: string;
                agency_address: string | null;
                agency_phone: string | null;
                agency_email: string | null;
            };
        } & {
            id: string;
            created_at: Date;
            updated_at: Date;
            name: string;
            description: string;
            price: number;
            itinerary: import("@prisma/client/runtime/library").JsonValue | null;
            inclusions: string[];
            exclusions: string[];
            duration: number;
            max_travelers: number | null;
            agency_id: string;
        })[];
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        name: string;
        language: string | null;
        city: string | null;
        country: string;
        description: string;
        latitude: number | null;
        longitude: number | null;
        activities: string[];
        currency: string | null;
        timezone: string | null;
        safety_index: number | null;
        cost_index: number | null;
        featured: boolean | null;
        meta_title: string | null;
        meta_description: string | null;
        highlights: string[];
        best_time_to_visit: string | null;
        travel_tips: string[];
        image_url: string | null;
    }>;
    static updateDestination(id: string, data: DestinationInput, files?: Express.Multer.File[]): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        name: string;
        language: string | null;
        city: string | null;
        country: string;
        description: string;
        latitude: number | null;
        longitude: number | null;
        activities: string[];
        currency: string | null;
        timezone: string | null;
        safety_index: number | null;
        cost_index: number | null;
        featured: boolean | null;
        meta_title: string | null;
        meta_description: string | null;
        highlights: string[];
        best_time_to_visit: string | null;
        travel_tips: string[];
        image_url: string | null;
    }>;
    static deleteDestination(id: string): Promise<{
        message: string;
    }>;
    static setFeaturedImage(id: string, imageId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    static getTrendingDestinations(limit?: number): Promise<unknown>;
    static getNearbyDestinations(latitude: number, longitude: number, radiusKm?: number, limit?: number): Promise<unknown>;
    static getDestinationWeather(id: string): Promise<{
        destination: string;
        current: {
            temperature: number;
            condition: string;
            humidity: number;
            wind_speed: number;
            icon: string;
        };
        forecast: {
            date: string;
            high: number;
            low: number;
            condition: string;
        }[];
    }>;
    static getDestinationAttractions(id: string, limit?: number): Promise<{
        name: string;
        type: string;
        rating: number;
        description: string;
        address: string;
        image_url: string;
        website: string;
    }[]>;
}
//# sourceMappingURL=destinationService.d.ts.map
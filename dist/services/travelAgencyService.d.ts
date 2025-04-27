import type { TravelAgencyProfileInput, TravelPackageInput } from "../validators/travelAgencyValidators";
export declare class TravelAgencyService {
    static register(userId: string, data: TravelAgencyProfileInput): Promise<{
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
    }>;
    static getProfile(userId: string): Promise<{
        user: {
            id: string;
            first_name: string;
            email: string;
            last_name: string | null;
            phone_number: string | null;
            profile_picture: string | null;
        };
    } & {
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
    }>;
    static updateProfile(userId: string, data: TravelAgencyProfileInput): Promise<{
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
    }>;
    static createPackage(userId: string, data: TravelPackageInput, files?: Express.Multer.File[]): Promise<{
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
    }>;
    static getPackages(agencyId: string): Promise<({
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
        destinations: {
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
        }[];
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
    })[]>;
    static getPackageById(packageId: string): Promise<{
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
        destinations: {
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
        }[];
        agency: {
            user: {
                id: string;
                first_name: string;
                email: string;
                last_name: string | null;
                profile_picture: string | null;
            };
        } & {
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
    }>;
    static updatePackage(userId: string, packageId: string, data: TravelPackageInput, files?: Express.Multer.File[]): Promise<{
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
    }>;
    static deletePackage(userId: string, packageId: string): Promise<{
        message: string;
    }>;
    static getOrders(userId: string): Promise<({
        user: {
            id: string;
            first_name: string;
            email: string;
            last_name: string | null;
            phone_number: string | null;
        };
        package: {
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
        };
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        status: import("@prisma/client").$Enums.OrderStatus;
        user_id: string;
        start_date: Date;
        package_id: string;
        total_price: number;
        special_requests: string | null;
        agency_response: string | null;
        travelers: number;
    })[]>;
    static respondToOrder(userId: string, orderId: string, response: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        status: import("@prisma/client").$Enums.OrderStatus;
        user_id: string;
        start_date: Date;
        package_id: string;
        total_price: number;
        special_requests: string | null;
        agency_response: string | null;
        travelers: number;
    }>;
}
//# sourceMappingURL=travelAgencyService.d.ts.map
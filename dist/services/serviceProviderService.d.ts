import type { ServiceProviderProfileInput, ServiceInput } from "../validators/serviceProviderValidators";
export declare class ServiceProviderService {
    static register(userId: string, data: ServiceProviderProfileInput): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        rating: number;
        description: string | null;
        business_name: string;
        business_address: string | null;
        business_phone: string | null;
        business_email: string | null;
        website: string | null;
        verified: boolean;
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
        business_name: string;
        business_address: string | null;
        business_phone: string | null;
        business_email: string | null;
        website: string | null;
        verified: boolean;
    }>;
    static updateProfile(userId: string, data: ServiceProviderProfileInput): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        rating: number;
        description: string | null;
        business_name: string;
        business_address: string | null;
        business_phone: string | null;
        business_email: string | null;
        website: string | null;
        verified: boolean;
    }>;
    static createService(userId: string, data: ServiceInput, files?: Express.Multer.File[]): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        name: string;
        description: string;
        location: string | null;
        price: number;
        max_participants: number | null;
        duration: number;
        category: string;
        availability: import("@prisma/client/runtime/library").JsonValue | null;
        provider_id: string;
    }>;
    static getServices(providerId: string): Promise<({
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
        description: string;
        location: string | null;
        price: number;
        max_participants: number | null;
        duration: number;
        category: string;
        availability: import("@prisma/client/runtime/library").JsonValue | null;
        provider_id: string;
    })[]>;
    static getServiceById(serviceId: string): Promise<{
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
        provider: {
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
            business_name: string;
            business_address: string | null;
            business_phone: string | null;
            business_email: string | null;
            website: string | null;
            verified: boolean;
        };
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        name: string;
        description: string;
        location: string | null;
        price: number;
        max_participants: number | null;
        duration: number;
        category: string;
        availability: import("@prisma/client/runtime/library").JsonValue | null;
        provider_id: string;
    }>;
    static updateService(userId: string, serviceId: string, data: ServiceInput, files?: Express.Multer.File[]): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        name: string;
        description: string;
        location: string | null;
        price: number;
        max_participants: number | null;
        duration: number;
        category: string;
        availability: import("@prisma/client/runtime/library").JsonValue | null;
        provider_id: string;
    }>;
    static deleteService(userId: string, serviceId: string): Promise<{
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
        service: {
            id: string;
            created_at: Date;
            updated_at: Date;
            name: string;
            description: string;
            location: string | null;
            price: number;
            max_participants: number | null;
            duration: number;
            category: string;
            availability: import("@prisma/client/runtime/library").JsonValue | null;
            provider_id: string;
        };
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        status: import("@prisma/client").$Enums.OrderStatus;
        date: Date;
        user_id: string;
        service_id: string;
        total_price: number;
        special_requests: string | null;
        participants: number;
        provider_response: string | null;
    })[]>;
    static respondToOrder(userId: string, orderId: string, response: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        status: import("@prisma/client").$Enums.OrderStatus;
        date: Date;
        user_id: string;
        service_id: string;
        total_price: number;
        special_requests: string | null;
        participants: number;
        provider_response: string | null;
    }>;
}
//# sourceMappingURL=serviceProviderService.d.ts.map
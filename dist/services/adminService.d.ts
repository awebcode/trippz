import type { Role, User, Prisma } from "@prisma/client";
import type { PaginatedResult } from "../validators/commonValidators";
import type { AnalyticsQuery, SystemSettingsInput, UserQuery } from "../validators/adminValidators";
export declare class AdminService {
    static getUsers(query: UserQuery): Promise<PaginatedResult<User>>;
    static getUserById(id: string): Promise<{
        bookings: {
            id: string;
            created_at: Date;
            updated_at: Date;
            status: import("@prisma/client").$Enums.BookingStatus;
            user_id: string;
            guests: number | null;
            hotel_id: string | null;
            end_date: Date;
            start_date: Date;
            flight_id: string | null;
            trip_id: string | null;
            booking_type: import("@prisma/client").$Enums.BookingType;
            total_price: number;
            special_requests: string | null;
            cancellation_id: string | null;
        }[];
        reviews: {
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            rating: number;
            hotel_id: string | null;
            flight_id: string | null;
            trip_id: string | null;
            comment: string | null;
        }[];
        addresses: {
            id: string;
            created_at: Date;
            updated_at: Date;
            address: string;
            user_id: string;
            city: string;
            country: string;
            postal_code: string;
        }[];
        Profile: {
            id: string;
            updated_at: Date;
            address: string | null;
            profile_picture: string | null;
            bio: string | null;
            theme: string;
            language: string;
            user_id: string;
        } | null;
        serviceProvider: {
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
        } | null;
        travelAgency: {
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
        } | null;
    } & {
        id: string;
        created_at: Date;
        updated_at: Date;
        first_name: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        last_name: string | null;
        phone_number: string | null;
        password_hash: string;
        email_verified: boolean;
        phone_verified: boolean;
        date_of_birth: Date | null;
        address: string | null;
        profile_picture: string | null;
    }>;
    static updateUserRole(id: string, role: Role): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        first_name: string;
        email: string;
        role: import("@prisma/client").$Enums.Role;
        last_name: string | null;
        phone_number: string | null;
        password_hash: string;
        email_verified: boolean;
        phone_verified: boolean;
        date_of_birth: Date | null;
        address: string | null;
        profile_picture: string | null;
    }>;
    static deleteUser(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    static getStats(): Promise<{
        users: {
            total: number;
            serviceProviders: number;
            travelAgencies: number;
        };
        content: {
            destinations: number;
            packages: number;
            services: number;
        };
        orders: {
            serviceOrders: number;
            packageOrders: number;
            bookings: number;
            total: number;
        };
        revenue: {
            total: number;
        };
    }>;
    static getAnalytics(query: AnalyticsQuery): Promise<{
        userRegistrations: unknown;
        bookings: unknown;
        revenue: unknown;
        orders: {
            serviceOrdersByStatus: (Prisma.PickEnumerable<Prisma.ServiceOrderGroupByOutputType, "status"[]> & {
                _count: {
                    id: number;
                };
            })[];
            packageOrdersByStatus: (Prisma.PickEnumerable<Prisma.PackageOrderGroupByOutputType, "status"[]> & {
                _count: {
                    id: number;
                };
            })[];
            bookingsByStatus: (Prisma.PickEnumerable<Prisma.BookingGroupByOutputType, "status"[]> & {
                _count: {
                    id: number;
                };
            })[];
        };
        topDestinations: {
            id: string;
            name: string;
            country: string;
            packageCount: number;
            orderCount: number;
        }[];
        topServices: {
            id: string;
            name: string;
            provider_id: string;
            orderCount: number;
            revenue: number;
        }[];
    }>;
    static getSystemSettings(): Promise<{
        id: string;
        maintenance_mode: boolean;
        booking_fee_percentage: number;
        default_currency: string;
        support_email: string;
        support_phone: string;
        terms_url: string;
        privacy_url: string;
        created_at: Date;
        updated_at: Date;
    }>;
    static updateSystemSettings(data: SystemSettingsInput): Promise<{
        id: string;
        maintenance_mode: boolean;
        booking_fee_percentage: number;
        default_currency: string;
        support_email: string;
        support_phone: string;
        terms_url: string;
        privacy_url: string;
        created_at: Date;
        updated_at: Date;
    }>;
    static getAllDestinations(query: any): Promise<{
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
            packages: {
                id: string;
                name: string;
                _count: {
                    PackageOrder: number;
                };
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
            filteredCount: number;
            totalPages: number;
            currentPage: any;
            limit: any;
            hasNextPage: boolean;
            hasPreviousPage: boolean;
        };
    }>;
    private static getUserRegistrationsByPeriod;
    private static getBookingsByPeriod;
    private static getRevenueByPeriod;
}
//# sourceMappingURL=adminService.d.ts.map
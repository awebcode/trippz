import type { UpdateProfileInput, UpdatePasswordInput, AddAddressInput } from "../validators/userValidators";
export declare class UserService {
    static getProfile(userId: string): Promise<{
        id: string;
        first_name: string;
        last_name: string | null;
        email: string;
        phone_number: string | null;
        role: import("@prisma/client").$Enums.Role;
        email_verified: boolean;
        phone_verified: boolean;
        date_of_birth: Date | null;
        address: string | null;
        profile_picture: string | null;
        profile: {
            id: string;
            updated_at: Date;
            address: string | null;
            profile_picture: string | null;
            bio: string | null;
            theme: string;
            language: string;
            user_id: string;
        } | null;
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
    }>;
    static updateProfile(userId: string, data: UpdateProfileInput): Promise<{
        id: string;
        first_name: string;
        last_name: string | null;
        email: string;
        profile: {
            id: string;
            updated_at: Date;
            address: string | null;
            profile_picture: string | null;
            bio: string | null;
            theme: string;
            language: string;
            user_id: string;
        } | null;
    }>;
    static updatePassword(userId: string, data: UpdatePasswordInput): Promise<{
        message: string;
    }>;
    static uploadProfilePicture(userId: string, file: Express.Multer.File): Promise<{
        id: string;
        profile_picture: string | null;
    }>;
    static addAddress(userId: string, data: AddAddressInput): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        address: string;
        user_id: string;
        city: string;
        country: string;
        postal_code: string;
    }>;
    static getAddresses(userId: string): Promise<{
        id: string;
        created_at: Date;
        updated_at: Date;
        address: string;
        user_id: string;
        city: string;
        country: string;
        postal_code: string;
    }[]>;
    static deleteAddress(userId: string, addressId: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=userService.d.ts.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TravelAgencyService = void 0;
const prisma_1 = require("../lib/prisma");
const appError_1 = require("../utils/appError");
const logger_1 = require("../utils/logger");
const fileUpload_1 = require("../utils/fileUpload");
class TravelAgencyService {
    static async register(userId, data) {
        try {
            // Check if user exists
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new appError_1.AppError("User not found", 404);
            }
            // Check if user is already a travel agency
            const existingAgency = await prisma_1.prisma.travelAgency.findUnique({
                where: { user_id: userId },
            });
            if (existingAgency) {
                throw new appError_1.AppError("User is already registered as a travel agency", 400);
            }
            // Create travel agency profile
            const travelAgency = await prisma_1.prisma.travelAgency.create({
                data: {
                    user_id: userId,
                    agency_name: data.agency_name,
                    agency_address: data.agency_address,
                    agency_phone: data.agency_phone,
                    agency_email: data.agency_email,
                    website: data.website,
                    description: data.description,
                },
            });
            // Update user role
            await prisma_1.prisma.user.update({
                where: { id: userId },
                data: { role: "TRAVEL_AGENCY" },
            });
            return travelAgency;
        }
        catch (error) {
            logger_1.logger.error(`Error in registerTravelAgency: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to register as travel agency", 500);
        }
    }
    static async getProfile(userId) {
        try {
            const travelAgency = await prisma_1.prisma.travelAgency.findFirst({
                where: { user_id: userId },
                include: {
                    user: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                            email: true,
                            phone_number: true,
                            profile_picture: true,
                        },
                    },
                },
            });
            if (!travelAgency) {
                throw new appError_1.AppError("Travel agency profile not found", 404);
            }
            return travelAgency;
        }
        catch (error) {
            logger_1.logger.error(`Error in getTravelAgencyProfile: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to get travel agency profile", 500);
        }
    }
    static async updateProfile(userId, data) {
        try {
            const travelAgency = await prisma_1.prisma.travelAgency.findFirst({
                where: { user_id: userId },
            });
            if (!travelAgency) {
                throw new appError_1.AppError("Travel agency profile not found", 404);
            }
            const updatedProfile = await prisma_1.prisma.travelAgency.update({
                where: { id: travelAgency.id },
                data: {
                    agency_name: data.agency_name,
                    agency_address: data.agency_address,
                    agency_phone: data.agency_phone,
                    agency_email: data.agency_email,
                    website: data.website,
                    description: data.description,
                },
            });
            return updatedProfile;
        }
        catch (error) {
            logger_1.logger.error(`Error in updateTravelAgencyProfile: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to update travel agency profile", 500);
        }
    }
    static async createPackage(userId, data, files) {
        try {
            const travelAgency = await prisma_1.prisma.travelAgency.findFirst({
                where: { user_id: userId },
            });
            if (!travelAgency) {
                throw new appError_1.AppError("Travel agency profile not found", 404);
            }
            // Verify that all destinations exist
            const destinations = await prisma_1.prisma.destination.findMany({
                where: {
                    id: {
                        in: data.destination_ids,
                    },
                },
            });
            if (destinations.length !== data.destination_ids.length) {
                throw new appError_1.AppError("One or more destinations not found", 404);
            }
            const travelPackage = await prisma_1.prisma.travelPackage.create({
                data: {
                    agency_id: travelAgency.id,
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    duration: data.duration,
                    inclusions: data.inclusions,
                    exclusions: data.exclusions,
                    itinerary: data.itinerary,
                    max_travelers: data.max_travelers,
                    destinations: {
                        connect: data.destination_ids.map((id) => ({ id })),
                    },
                },
            });
            // Upload images if provided
            if (files && files.length > 0) {
                await Promise.all(files.map(async (file) => {
                    const uploadResult = await (0, fileUpload_1.uploadToCloudinary)(file.path, "trippz/packages");
                    await prisma_1.prisma.image.create({
                        data: {
                            package_id: travelPackage.id,
                            file_url: uploadResult.url,
                            file_type: file.mimetype,
                        },
                    });
                }));
            }
            return travelPackage;
        }
        catch (error) {
            logger_1.logger.error(`Error in createPackage: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to create travel package", 500);
        }
    }
    static async getPackages(agencyId) {
        try {
            const travelAgency = await prisma_1.prisma.travelAgency.findFirst({
                where: { user_id: agencyId },
            });
            if (!travelAgency) {
                throw new appError_1.AppError("Travel agency profile not found", 404);
            }
            const packages = await prisma_1.prisma.travelPackage.findMany({
                where: { agency_id: travelAgency.id },
                include: {
                    images: true,
                    destinations: true,
                },
            });
            return packages;
        }
        catch (error) {
            logger_1.logger.error(`Error in getPackages: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to get travel packages", 500);
        }
    }
    static async getPackageById(packageId) {
        try {
            const travelPackage = await prisma_1.prisma.travelPackage.findUnique({
                where: { id: packageId },
                include: {
                    images: true,
                    destinations: true,
                    agency: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    first_name: true,
                                    last_name: true,
                                    email: true,
                                    profile_picture: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!travelPackage) {
                throw new appError_1.AppError("Travel package not found", 404);
            }
            return travelPackage;
        }
        catch (error) {
            logger_1.logger.error(`Error in getPackageById: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to get travel package", 500);
        }
    }
    static async updatePackage(userId, packageId, data, files) {
        try {
            const travelAgency = await prisma_1.prisma.travelAgency.findFirst({
                where: { user_id: userId },
            });
            if (!travelAgency) {
                throw new appError_1.AppError("Travel agency profile not found", 404);
            }
            const travelPackage = await prisma_1.prisma.travelPackage.findUnique({
                where: { id: packageId },
            });
            if (!travelPackage) {
                throw new appError_1.AppError("Travel package not found", 404);
            }
            if (travelPackage.agency_id !== travelAgency.id) {
                throw new appError_1.AppError("You are not authorized to update this package", 403);
            }
            // Verify that all destinations exist
            const destinations = await prisma_1.prisma.destination.findMany({
                where: {
                    id: {
                        in: data.destination_ids,
                    },
                },
            });
            if (destinations.length !== data.destination_ids.length) {
                throw new appError_1.AppError("One or more destinations not found", 404);
            }
            // Update package
            const updatedPackage = await prisma_1.prisma.travelPackage.update({
                where: { id: packageId },
                data: {
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    duration: data.duration,
                    inclusions: data.inclusions,
                    exclusions: data.exclusions,
                    itinerary: data.itinerary,
                    max_travelers: data.max_travelers,
                    destinations: {
                        set: data.destination_ids.map((id) => ({ id })),
                    },
                },
            });
            // Upload images if provided
            if (files && files.length > 0) {
                await Promise.all(files.map(async (file) => {
                    const uploadResult = await (0, fileUpload_1.uploadToCloudinary)(file.path, "trippz/packages");
                    await prisma_1.prisma.image.create({
                        data: {
                            package_id: packageId,
                            file_url: uploadResult.url,
                            file_type: file.mimetype,
                        },
                    });
                }));
            }
            return updatedPackage;
        }
        catch (error) {
            logger_1.logger.error(`Error in updatePackage: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to update travel package", 500);
        }
    }
    static async deletePackage(userId, packageId) {
        try {
            const travelAgency = await prisma_1.prisma.travelAgency.findFirst({
                where: { user_id: userId },
            });
            if (!travelAgency) {
                throw new appError_1.AppError("Travel agency profile not found", 404);
            }
            const travelPackage = await prisma_1.prisma.travelPackage.findUnique({
                where: { id: packageId },
            });
            if (!travelPackage) {
                throw new appError_1.AppError("Travel package not found", 404);
            }
            if (travelPackage.agency_id !== travelAgency.id) {
                throw new appError_1.AppError("You are not authorized to delete this package", 403);
            }
            // Delete package images
            await prisma_1.prisma.image.deleteMany({
                where: { package_id: packageId },
            });
            // Delete package
            await prisma_1.prisma.travelPackage.delete({
                where: { id: packageId },
            });
            return { message: "Travel package deleted successfully" };
        }
        catch (error) {
            logger_1.logger.error(`Error in deletePackage: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to delete travel package", 500);
        }
    }
    static async getOrders(userId) {
        try {
            const travelAgency = await prisma_1.prisma.travelAgency.findFirst({
                where: { user_id: userId },
            });
            if (!travelAgency) {
                throw new appError_1.AppError("Travel agency profile not found", 404);
            }
            const orders = await prisma_1.prisma.packageOrder.findMany({
                where: {
                    package: {
                        agency_id: travelAgency.id,
                    },
                },
                include: {
                    package: true,
                    user: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                            email: true,
                            phone_number: true,
                        },
                    },
                },
            });
            return orders;
        }
        catch (error) {
            logger_1.logger.error(`Error in getOrders: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to get orders", 500);
        }
    }
    static async respondToOrder(userId, orderId, response) {
        try {
            const travelAgency = await prisma_1.prisma.travelAgency.findFirst({
                where: { user_id: userId },
            });
            if (!travelAgency) {
                throw new appError_1.AppError("Travel agency profile not found", 404);
            }
            const order = await prisma_1.prisma.packageOrder.findUnique({
                where: { id: orderId },
                include: {
                    package: true,
                },
            });
            if (!order) {
                throw new appError_1.AppError("Order not found", 404);
            }
            if (order.package.agency_id !== travelAgency.id) {
                throw new appError_1.AppError("You are not authorized to respond to this order", 403);
            }
            const updatedOrder = await prisma_1.prisma.packageOrder.update({
                where: { id: orderId },
                data: {
                    agency_response: response,
                    status: "CONFIRMED",
                },
            });
            return updatedOrder;
        }
        catch (error) {
            logger_1.logger.error(`Error in respondToOrder: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to respond to order", 500);
        }
    }
}
exports.TravelAgencyService = TravelAgencyService;
//# sourceMappingURL=travelAgencyService.js.map
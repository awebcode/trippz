"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceProviderService = void 0;
const prisma_1 = require("../lib/prisma");
const appError_1 = require("../utils/appError");
const logger_1 = require("../utils/logger");
const fileUpload_1 = require("../utils/fileUpload");
class ServiceProviderService {
    static async register(userId, data) {
        try {
            // Check if user exists
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new appError_1.AppError("User not found", 404);
            }
            // Check if user is already a service provider
            const existingProvider = await prisma_1.prisma.serviceProvider.findUnique({
                where: { user_id: userId },
            });
            if (existingProvider) {
                throw new appError_1.AppError("User is already registered as a service provider", 400);
            }
            // Create service provider profile
            const serviceProvider = await prisma_1.prisma.serviceProvider.create({
                data: {
                    user_id: userId,
                    business_name: data.business_name,
                    business_address: data.business_address,
                    business_phone: data.business_phone,
                    business_email: data.business_email,
                    website: data.website,
                    description: data.description,
                },
            });
            // Update user role
            await prisma_1.prisma.user.update({
                where: { id: userId },
                data: { role: "SERVICE_PROVIDER" },
            });
            return serviceProvider;
        }
        catch (error) {
            logger_1.logger.error(`Error in registerServiceProvider: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to register as service provider", 500);
        }
    }
    static async getProfile(userId) {
        try {
            const serviceProvider = await prisma_1.prisma.serviceProvider.findFirst({
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
            if (!serviceProvider) {
                throw new appError_1.AppError("Service provider profile not found", 404);
            }
            return serviceProvider;
        }
        catch (error) {
            logger_1.logger.error(`Error in getServiceProviderProfile: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to get service provider profile", 500);
        }
    }
    static async updateProfile(userId, data) {
        try {
            const serviceProvider = await prisma_1.prisma.serviceProvider.findFirst({
                where: { user_id: userId },
            });
            if (!serviceProvider) {
                throw new appError_1.AppError("Service provider profile not found", 404);
            }
            const updatedProfile = await prisma_1.prisma.serviceProvider.update({
                where: { id: serviceProvider.id },
                data: {
                    business_name: data.business_name,
                    business_address: data.business_address,
                    business_phone: data.business_phone,
                    business_email: data.business_email,
                    website: data.website,
                    description: data.description,
                },
            });
            return updatedProfile;
        }
        catch (error) {
            logger_1.logger.error(`Error in updateServiceProviderProfile: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to update service provider profile", 500);
        }
    }
    static async createService(userId, data, files) {
        try {
            const serviceProvider = await prisma_1.prisma.serviceProvider.findFirst({
                where: { user_id: userId },
            });
            if (!serviceProvider) {
                throw new appError_1.AppError("Service provider profile not found", 404);
            }
            const service = await prisma_1.prisma.service.create({
                data: {
                    provider_id: serviceProvider.id,
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    duration: data.duration,
                    location: data.location,
                    category: data.category,
                    availability: data.availability,
                    max_participants: data.max_participants,
                },
            });
            // Upload images if provided
            if (files && files.length > 0) {
                await Promise.all(files.map(async (file) => {
                    const uploadResult = await (0, fileUpload_1.uploadToCloudinary)(file.path, "trippz/services");
                    await prisma_1.prisma.image.create({
                        data: {
                            service_id: service.id,
                            file_url: uploadResult.url,
                            file_type: file.mimetype,
                        },
                    });
                }));
            }
            return service;
        }
        catch (error) {
            logger_1.logger.error(`Error in createService: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to create service", 500);
        }
    }
    static async getServices(providerId) {
        try {
            const serviceProvider = await prisma_1.prisma.serviceProvider.findFirst({
                where: { user_id: providerId },
            });
            if (!serviceProvider) {
                throw new appError_1.AppError("Service provider profile not found", 404);
            }
            const services = await prisma_1.prisma.service.findMany({
                where: { provider_id: serviceProvider.id },
                include: {
                    images: true,
                },
            });
            return services;
        }
        catch (error) {
            logger_1.logger.error(`Error in getServices: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to get services", 500);
        }
    }
    static async getServiceById(serviceId) {
        try {
            const service = await prisma_1.prisma.service.findUnique({
                where: { id: serviceId },
                include: {
                    images: true,
                    provider: {
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
            if (!service) {
                throw new appError_1.AppError("Service not found", 404);
            }
            return service;
        }
        catch (error) {
            logger_1.logger.error(`Error in getServiceById: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to get service", 500);
        }
    }
    static async updateService(userId, serviceId, data, files) {
        try {
            const serviceProvider = await prisma_1.prisma.serviceProvider.findFirst({
                where: { user_id: userId },
            });
            if (!serviceProvider) {
                throw new appError_1.AppError("Service provider profile not found", 404);
            }
            const service = await prisma_1.prisma.service.findUnique({
                where: { id: serviceId },
            });
            if (!service) {
                throw new appError_1.AppError("Service not found", 404);
            }
            if (service.provider_id !== serviceProvider.id) {
                throw new appError_1.AppError("You are not authorized to update this service", 403);
            }
            const updatedService = await prisma_1.prisma.service.update({
                where: { id: serviceId },
                data: {
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    duration: data.duration,
                    location: data.location,
                    category: data.category,
                    availability: data.availability,
                    max_participants: data.max_participants,
                },
            });
            // Upload images if provided
            if (files && files.length > 0) {
                await Promise.all(files.map(async (file) => {
                    const uploadResult = await (0, fileUpload_1.uploadToCloudinary)(file.path, "trippz/services");
                    await prisma_1.prisma.image.create({
                        data: {
                            service_id: service.id,
                            file_url: uploadResult.url,
                            file_type: file.mimetype,
                        },
                    });
                }));
            }
            return updatedService;
        }
        catch (error) {
            logger_1.logger.error(`Error in updateService: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to update service", 500);
        }
    }
    static async deleteService(userId, serviceId) {
        try {
            const serviceProvider = await prisma_1.prisma.serviceProvider.findFirst({
                where: { user_id: userId },
            });
            if (!serviceProvider) {
                throw new appError_1.AppError("Service provider profile not found", 404);
            }
            const service = await prisma_1.prisma.service.findUnique({
                where: { id: serviceId },
            });
            if (!service) {
                throw new appError_1.AppError("Service not found", 404);
            }
            if (service.provider_id !== serviceProvider.id) {
                throw new appError_1.AppError("You are not authorized to delete this service", 403);
            }
            // Delete service images
            await prisma_1.prisma.image.deleteMany({
                where: { service_id: serviceId },
            });
            // Delete service
            await prisma_1.prisma.service.delete({
                where: { id: serviceId },
            });
            return { message: "Service deleted successfully" };
        }
        catch (error) {
            logger_1.logger.error(`Error in deleteService: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to delete service", 500);
        }
    }
    static async getOrders(userId) {
        try {
            const serviceProvider = await prisma_1.prisma.serviceProvider.findFirst({
                where: { user_id: userId },
            });
            if (!serviceProvider) {
                throw new appError_1.AppError("Service provider profile not found", 404);
            }
            const orders = await prisma_1.prisma.serviceOrder.findMany({
                where: {
                    service: {
                        provider_id: serviceProvider.id,
                    },
                },
                include: {
                    service: true,
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
            const serviceProvider = await prisma_1.prisma.serviceProvider.findFirst({
                where: { user_id: userId },
            });
            if (!serviceProvider) {
                throw new appError_1.AppError("Service provider profile not found", 404);
            }
            const order = await prisma_1.prisma.serviceOrder.findUnique({
                where: { id: orderId },
                include: {
                    service: true,
                },
            });
            if (!order) {
                throw new appError_1.AppError("Order not found", 404);
            }
            if (order.service.provider_id !== serviceProvider.id) {
                throw new appError_1.AppError("You are not authorized to respond to this order", 403);
            }
            const updatedOrder = await prisma_1.prisma.serviceOrder.update({
                where: { id: orderId },
                data: {
                    provider_response: response,
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
exports.ServiceProviderService = ServiceProviderService;
//# sourceMappingURL=serviceProviderService.js.map
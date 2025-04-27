"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripService = void 0;
const prisma_1 = require("../lib/prisma");
const appError_1 = require("../utils/appError");
const logger_1 = require("../utils/logger");
class TripService {
    static async createTrip(userId, data) {
        try {
            const trip = await prisma_1.prisma.trip.create({
                data: {
                    user_id: userId,
                    trip_name: data.trip_name,
                    description: data.description,
                    start_date: new Date(data.start_date),
                    end_date: new Date(data.end_date),
                    trip_type: data.trip_type,
                    price: data.price,
                    max_participants: data.max_participants,
                    itinerary: data.itinerary,
                    inclusions: data.inclusions,
                    exclusions: data.exclusions,
                    cancellation_policy: data.cancellation_policy,
                },
            });
            // Connect destinations if provided
            if (data.destination_ids && data.destination_ids.length > 0) {
                for (const destinationId of data.destination_ids) {
                    await prisma_1.prisma.tripDestination.create({
                        data: {
                            trip_id: trip.id,
                            destination_id: destinationId,
                        },
                    });
                }
            }
            return trip;
        }
        catch (error) {
            logger_1.logger.error(`Error in createTrip: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to create trip", 500);
        }
    }
    static async getTrips(params) {
        try {
            const { page = 1, limit = 10, sortBy = "created_at", sortOrder = "desc", trip_type, destination, start_date, end_date, minPrice, maxPrice, duration_min, duration_max, min_rating, max_participants, has_availability, includes_flight, includes_hotel, includes_activities, includes_meals, is_guided, is_family_friendly, is_accessible, has_free_cancellation, } = params;
            // Calculate pagination values
            const skip = (page - 1) * limit;
            // Build where conditions
            const where = {};
            if (trip_type) {
                where.trip_type = trip_type;
            }
            if (destination) {
                where.OR = [
                    {
                        description: {
                            contains: destination,
                            mode: "insensitive",
                        },
                    },
                    {
                        trip_name: {
                            contains: destination,
                            mode: "insensitive",
                        },
                    },
                    {
                        tripDestinations: {
                            some: {
                                destination: {
                                    name: {
                                        contains: destination,
                                        mode: "insensitive",
                                    },
                                },
                            },
                        },
                    },
                ];
            }
            if (start_date) {
                where.start_date = {
                    gte: new Date(start_date),
                };
            }
            if (end_date) {
                where.end_date = {
                    lte: new Date(end_date),
                };
            }
            if (minPrice !== undefined || maxPrice !== undefined) {
                where.price = {};
                if (minPrice !== undefined) {
                    where.price.gte = minPrice;
                }
                if (maxPrice !== undefined) {
                    where.price.lte = maxPrice;
                }
            }
            if (max_participants !== undefined) {
                where.max_participants = {
                    gte: max_participants,
                };
            }
            // Advanced filters
            const inclusionFilters = [];
            if (includes_flight === true) {
                inclusionFilters.push("flight");
            }
            if (includes_hotel === true) {
                inclusionFilters.push("hotel");
            }
            if (includes_activities === true) {
                inclusionFilters.push("activities");
            }
            if (includes_meals === true) {
                inclusionFilters.push("meals");
            }
            if (inclusionFilters.length > 0) {
                where.inclusions = {
                    hasSome: inclusionFilters,
                };
            }
            if (is_guided === true) {
                where.inclusions = {
                    ...where.inclusions,
                    hasSome: [...(where.inclusions?.hasSome || []), "guided tour"],
                };
            }
            if (is_family_friendly === true) {
                where.inclusions = {
                    ...where.inclusions,
                    hasSome: [...(where.inclusions?.hasSome || []), "family friendly"],
                };
            }
            if (is_accessible === true) {
                where.inclusions = {
                    ...where.inclusions,
                    hasSome: [...(where.inclusions?.hasSome || []), "accessible"],
                };
            }
            if (has_free_cancellation === true) {
                where.cancellation_policy = {
                    contains: "free",
                    mode: "insensitive",
                };
            }
            // Get total count (without filters)
            const totalCount = await prisma_1.prisma.trip.count();
            // Get filtered count
            const filteredCount = await prisma_1.prisma.trip.count({ where });
            // Get paginated data
            const trips = await prisma_1.prisma.trip.findMany({
                where,
                include: {
                    images: true,
                    user: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                            profile_picture: true,
                        },
                    },
                    reviews: {
                        select: {
                            id: true,
                            rating: true,
                        },
                    },
                    tripDestinations: {
                        include: {
                            destination: {
                                select: {
                                    id: true,
                                    name: true,
                                    country: true,
                                    image_url: true,
                                },
                            },
                        },
                    },
                    _count: {
                        select: {
                            bookings: true,
                            reviews: true,
                        },
                    },
                },
                orderBy: {
                    [sortBy]: sortOrder,
                },
                skip,
                take: limit,
            });
            // Process trips to include average rating and duration
            let processedTrips = trips.map((trip) => {
                const avgRating = trip.reviews.length > 0
                    ? trip.reviews.reduce((sum, review) => sum + review.rating, 0) /
                        trip.reviews.length
                    : 0;
                // Calculate trip duration in days
                const durationMs = trip.end_date.getTime() - trip.start_date.getTime();
                const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
                // Format destinations
                const destinations = trip.tripDestinations.map((td) => td.destination);
                return {
                    ...trip,
                    avg_rating: avgRating,
                    review_count: trip._count.reviews,
                    booking_count: trip._count.bookings,
                    duration_days: durationDays,
                    destinations: destinations,
                    tripDestinations: undefined, // Remove raw tripDestinations
                    reviews: undefined, // Remove raw reviews
                    _count: undefined, // Remove count
                };
            });
            // Apply post-fetch filters
            if (min_rating !== undefined) {
                processedTrips = processedTrips.filter((trip) => trip.avg_rating >= min_rating);
            }
            if (duration_min !== undefined || duration_max !== undefined) {
                processedTrips = processedTrips.filter((trip) => {
                    if (duration_min !== undefined && trip.duration_days < duration_min) {
                        return false;
                    }
                    if (duration_max !== undefined && trip.duration_days > duration_max) {
                        return false;
                    }
                    return true;
                });
            }
            if (has_availability === true) {
                // This would typically involve checking bookings vs max_participants
                // For now, we'll assume trips with fewer bookings than max_participants are available
                processedTrips = processedTrips.filter((trip) => {
                    const maxParticipants = trip.max_participants || 20; // Default to 20 if not specified
                    return trip.booking_count < maxParticipants;
                });
            }
            // Calculate total pages
            const totalPages = Math.ceil(filteredCount / limit);
            return {
                data: processedTrips,
                metadata: {
                    totalCount,
                    filteredCount: processedTrips.length,
                    totalPages,
                    currentPage: page,
                    limit,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1,
                },
            };
        }
        catch (error) {
            logger_1.logger.error(`Error in getTrips: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to get trips", 500);
        }
    }
    static async getTripById(id) {
        try {
            const trip = await prisma_1.prisma.trip.findUnique({
                where: { id },
                include: {
                    images: true,
                    user: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                            profile_picture: true,
                        },
                    },
                    reviews: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    first_name: true,
                                    last_name: true,
                                    profile_picture: true,
                                },
                            },
                        },
                    },
                    bookings: {
                        where: {
                            status: "CONFIRMED",
                        },
                        select: {
                            id: true,
                            user_id: true,
                            start_date: true,
                            end_date: true,
                        },
                    },
                    tripDestinations: {
                        include: {
                            destination: {
                                select: {
                                    id: true,
                                    name: true,
                                    country: true,
                                    image_url: true,
                                    description: true,
                                },
                            },
                        },
                    },
                },
            });
            if (!trip) {
                throw new appError_1.AppError("Trip not found", 404);
            }
            // Calculate average rating
            const avgRating = trip.reviews.length > 0
                ? trip.reviews.reduce((sum, review) => sum + review.rating, 0) /
                    trip.reviews.length
                : 0;
            // Calculate trip duration in days
            const durationMs = trip.end_date.getTime() - trip.start_date.getTime();
            const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
            // Get booked dates
            const bookedDates = trip.bookings.map((booking) => ({
                start: booking.start_date,
                end: booking.end_date,
            }));
            // Format destinations
            const destinations = trip.tripDestinations.map((td) => td.destination);
            return {
                ...trip,
                avg_rating: avgRating,
                review_count: trip.reviews.length,
                duration_days: durationDays,
                booked_dates: bookedDates,
                destinations: destinations,
                tripDestinations: undefined, // Remove raw tripDestinations
                bookings: undefined, // Remove raw bookings
            };
        }
        catch (error) {
            logger_1.logger.error(`Error in getTripById: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to get trip", 500);
        }
    }
    static async updateTrip(userId, id, data) {
        try {
            const trip = await prisma_1.prisma.trip.findUnique({
                where: { id },
            });
            if (!trip) {
                throw new appError_1.AppError("Trip not found", 404);
            }
            if (trip.user_id !== userId) {
                throw new appError_1.AppError("You are not authorized to update this trip", 403);
            }
            const updatedTrip = await prisma_1.prisma.trip.update({
                where: { id },
                data: {
                    trip_name: data.trip_name,
                    description: data.description,
                    start_date: data.start_date ? new Date(data.start_date) : undefined,
                    end_date: data.end_date ? new Date(data.end_date) : undefined,
                    trip_type: data.trip_type,
                    price: data.price,
                    max_participants: data.max_participants,
                    itinerary: data.itinerary,
                    inclusions: data.inclusions,
                    exclusions: data.exclusions,
                    cancellation_policy: data.cancellation_policy,
                },
            });
            // Update destinations if provided
            if (data.destination_ids && data.destination_ids.length > 0) {
                // Remove existing destinations
                await prisma_1.prisma.tripDestination.deleteMany({
                    where: { trip_id: id },
                });
                // Add new destinations
                for (const destinationId of data.destination_ids) {
                    await prisma_1.prisma.tripDestination.create({
                        data: {
                            trip_id: id,
                            destination_id: destinationId,
                        },
                    });
                }
            }
            return updatedTrip;
        }
        catch (error) {
            logger_1.logger.error(`Error in updateTrip: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to update trip", 500);
        }
    }
    static async deleteTrip(userId, id) {
        try {
            const trip = await prisma_1.prisma.trip.findUnique({
                where: { id },
            });
            if (!trip) {
                throw new appError_1.AppError("Trip not found", 404);
            }
            if (trip.user_id !== userId) {
                throw new appError_1.AppError("You are not authorized to delete this trip", 403);
            }
            // Check if trip has active bookings
            const activeBookings = await prisma_1.prisma.booking.count({
                where: {
                    trip_id: id,
                    status: {
                        in: ["CONFIRMED", "PENDING"],
                    },
                },
            });
            if (activeBookings > 0) {
                throw new appError_1.AppError("Cannot delete trip with active bookings", 400);
            }
            // Delete trip destinations
            await prisma_1.prisma.tripDestination.deleteMany({
                where: { trip_id: id },
            });
            // Delete trip images
            await prisma_1.prisma.image.deleteMany({
                where: { trip_id: id },
            });
            // Delete trip reviews
            await prisma_1.prisma.review.deleteMany({
                where: { trip_id: id },
            });
            // Delete trip
            await prisma_1.prisma.trip.delete({
                where: { id },
            });
            return { message: "Trip deleted successfully" };
        }
        catch (error) {
            logger_1.logger.error(`Error in deleteTrip: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to delete trip", 500);
        }
    }
    static async searchTrips(params) {
        try {
            return this.getTrips(params);
        }
        catch (error) {
            logger_1.logger.error(`Error in searchTrips: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to search trips", 500);
        }
    }
    static async getTripAvailability(params) {
        try {
            const { trip_id, start_date, end_date, participants = 1 } = params;
            const trip = await prisma_1.prisma.trip.findUnique({
                where: { id: trip_id },
                include: {
                    bookings: {
                        where: {
                            status: {
                                in: ["CONFIRMED", "PENDING"],
                            },
                            OR: [
                                {
                                    // Booking starts during requested period
                                    start_date: {
                                        gte: new Date(start_date),
                                        lt: new Date(end_date),
                                    },
                                },
                                {
                                    // Booking ends during requested period
                                    end_date: {
                                        gt: new Date(start_date),
                                        lte: new Date(end_date),
                                    },
                                },
                                {
                                    // Booking spans the entire requested period
                                    AND: [
                                        {
                                            start_date: {
                                                lte: new Date(start_date),
                                            },
                                        },
                                        {
                                            end_date: {
                                                gte: new Date(end_date),
                                            },
                                        },
                                    ],
                                },
                            ],
                        },
                    },
                },
            });
            if (!trip) {
                throw new appError_1.AppError("Trip not found", 404);
            }
            // Calculate available spots
            const maxParticipants = trip.max_participants || 20; // Default to 20 if not specified
            const bookedParticipants = trip.bookings.length;
            const availableSpots = Math.max(0, maxParticipants - bookedParticipants);
            const canAccommodate = availableSpots >= participants;
            return {
                trip_id: trip.id,
                trip_name: trip.trip_name,
                trip_type: trip.trip_type,
                max_participants: maxParticipants,
                booked_participants: bookedParticipants,
                available_spots: availableSpots,
                requested_participants: participants,
                is_available: canAccommodate,
                requested_period: {
                    start_date: start_date,
                    end_date: end_date,
                },
            };
        }
        catch (error) {
            logger_1.logger.error(`Error in getTripAvailability: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to check trip availability", 500);
        }
    }
    // Custom query method for advanced trip searches
    static async customTripQuery(params) {
        try {
            const { page = 1, limit = 10, sortBy = "created_at", sortOrder = "desc", 
            // Custom query parameters
            destinations, activities, themes, travel_styles, group_size, price_range, duration_range, departure_months, difficulty_level, ...rest } = params;
            // Calculate pagination values
            const skip = (page - 1) * limit;
            // Build advanced where conditions
            const where = {};
            // Reuse basic filters from getTrips
            if (rest.trip_type) {
                where.trip_type = rest.trip_type;
            }
            // Add destinations filter
            if (destinations && destinations.length > 0) {
                where.tripDestinations = {
                    some: {
                        destination: {
                            name: {
                                in: destinations,
                            },
                        },
                    },
                };
            }
            // Add activities filter (assuming activities are stored in inclusions)
            if (activities && activities.length > 0) {
                where.inclusions = {
                    hasSome: activities,
                };
            }
            // Add themes filter (assuming themes are stored in trip_name or description)
            if (themes && themes.length > 0) {
                where.OR = where.OR || [];
                for (const theme of themes) {
                    where.OR.push({
                        trip_name: {
                            contains: theme,
                            mode: "insensitive",
                        },
                    });
                    where.OR.push({
                        description: {
                            contains: theme,
                            mode: "insensitive",
                        },
                    });
                }
            }
            // Add travel styles filter (assuming stored in trip_type or description)
            if (travel_styles && travel_styles.length > 0) {
                where.OR = where.OR || [];
                for (const style of travel_styles) {
                    where.OR.push({
                        trip_type: style,
                    });
                    where.OR.push({
                        description: {
                            contains: style,
                            mode: "insensitive",
                        },
                    });
                }
            }
            // Add group size filter
            if (group_size) {
                where.max_participants = {
                    lte: group_size,
                };
            }
            // Add price range filter
            if (price_range) {
                const [min, max] = price_range.split("-").map(Number);
                where.price = {
                    gte: min,
                    lte: max,
                };
            }
            // Add duration range filter (will be applied post-fetch)
            if (duration_range) {
                // This will be applied after fetching the data
                logger_1.logger.info(`Filtering for duration range: ${duration_range}`);
            }
            // Add departure months filter
            if (departure_months && departure_months.length > 0) {
                where.OR = where.OR || [];
                for (const month of departure_months) {
                    const monthIndex = [
                        "january",
                        "february",
                        "march",
                        "april",
                        "may",
                        "june",
                        "july",
                        "august",
                        "september",
                        "october",
                        "november",
                        "december",
                    ].indexOf(month.toLowerCase());
                    if (monthIndex !== -1) {
                        where.OR.push({
                            start_date: {
                                gte: new Date(new Date().getFullYear(), monthIndex, 1),
                                lt: new Date(new Date().getFullYear(), monthIndex + 1, 0),
                            },
                        });
                        // Also check next year
                        where.OR.push({
                            start_date: {
                                gte: new Date(new Date().getFullYear() + 1, monthIndex, 1),
                                lt: new Date(new Date().getFullYear() + 1, monthIndex + 1, 0),
                            },
                        });
                    }
                }
            }
            // Get filtered count
            const filteredCount = await prisma_1.prisma.trip.count({ where });
            // Get paginated data
            const trips = await prisma_1.prisma.trip.findMany({
                where,
                include: {
                    images: true,
                    user: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                            profile_picture: true,
                        },
                    },
                    reviews: {
                        select: {
                            id: true,
                            rating: true,
                        },
                    },
                    tripDestinations: {
                        include: {
                            destination: {
                                select: {
                                    id: true,
                                    name: true,
                                    country: true,
                                    image_url: true,
                                },
                            },
                        },
                    },
                    _count: {
                        select: {
                            bookings: true,
                            reviews: true,
                        },
                    },
                },
                orderBy: {
                    [sortBy]: sortOrder,
                },
                skip,
                take: limit,
            });
            // Process trips to include average rating and duration
            let processedTrips = trips.map((trip) => {
                const avgRating = trip.reviews.length > 0
                    ? trip.reviews.reduce((sum, review) => sum + review.rating, 0) /
                        trip.reviews.length
                    : 0;
                // Calculate trip duration in days
                const durationMs = trip.end_date.getTime() - trip.start_date.getTime();
                const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24));
                // Format destinations
                const destinations = trip.tripDestinations.map((td) => td.destination);
                return {
                    ...trip,
                    avg_rating: avgRating,
                    review_count: trip._count.reviews,
                    booking_count: trip._count.bookings,
                    duration_days: durationDays,
                    destinations: destinations,
                    tripDestinations: undefined,
                    reviews: undefined,
                    _count: undefined,
                };
            });
            // Apply post-fetch filters
            if (duration_range) {
                const [min, max] = duration_range.split("-").map(Number);
                processedTrips = processedTrips.filter((trip) => trip.duration_days >= min && trip.duration_days <= max);
            }
            // Apply difficulty level filter if provided
            if (difficulty_level) {
                // This is a placeholder for difficulty level filtering
                // In a real implementation, this would filter based on a difficulty field
                logger_1.logger.info(`Filtering for difficulty level: ${difficulty_level}`);
            }
            // Calculate total pages
            const totalPages = Math.ceil(filteredCount / limit);
            return {
                data: processedTrips,
                metadata: {
                    totalCount: await prisma_1.prisma.trip.count(),
                    filteredCount: processedTrips.length,
                    totalPages,
                    currentPage: page,
                    limit,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1,
                },
            };
        }
        catch (error) {
            logger_1.logger.error(`Error in customTripQuery: ${error}`);
            if (error instanceof appError_1.AppError) {
                throw error;
            }
            throw new appError_1.AppError("Failed to execute custom trip query", 500);
        }
    }
}
exports.TripService = TripService;
//# sourceMappingURL=tripService.js.map
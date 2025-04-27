"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicRoutes = void 0;
const express_1 = __importDefault(require("express"));
const destinationController_1 = require("../controllers/destinationController");
const travelAgencyService_1 = require("../services/travelAgencyService");
const serviceProviderService_1 = require("../services/serviceProviderService");
const catchAsync_1 = require("../utils/catchAsync");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const router = express_1.default.Router();
exports.publicRoutes = router;
// Destinations
router.get("/destinations", destinationController_1.DestinationController.getDestinations);
router.get("/destinations/:id", destinationController_1.DestinationController.getDestinationById);
// Packages
router.get("/packages", (0, catchAsync_1.catchAsync)(async (req, res) => {
    const packages = await prisma.travelPackage.findMany({
        include: {
            images: true,
            agency: {
                select: {
                    id: true,
                    agency_name: true,
                    rating: true,
                },
            },
            destinations: {
                select: {
                    id: true,
                    name: true,
                    country: true,
                },
            },
        },
    });
    res.status(200).json({
        success: true,
        data: packages,
    });
}));
router.get("/packages/:id", (0, catchAsync_1.catchAsync)(async (req, res) => {
    const packageId = req.params.id;
    const travelPackage = await travelAgencyService_1.TravelAgencyService.getPackageById(packageId);
    res.status(200).json({
        success: true,
        data: travelPackage,
    });
}));
// Services
router.get("/services", (0, catchAsync_1.catchAsync)(async (req, res) => {
    const services = await prisma.service.findMany({
        include: {
            images: true,
            provider: {
                select: {
                    id: true,
                    business_name: true,
                    rating: true,
                },
            },
        },
    });
    res.status(200).json({
        success: true,
        data: services,
    });
}));
router.get("/services/:id", (0, catchAsync_1.catchAsync)(async (req, res) => {
    const serviceId = req.params.id;
    const service = await serviceProviderService_1.ServiceProviderService.getServiceById(serviceId);
    res.status(200).json({
        success: true,
        data: service,
    });
}));
// Search
router.get("/search", (0, catchAsync_1.catchAsync)(async (req, res) => {
    const { query, type, country, minPrice, maxPrice } = req.query;
    let destinations = [];
    let packages = [];
    let services = [];
    if (!type || type === "destination") {
        destinations = await prisma.destination.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { country: { contains: query, mode: "insensitive" } },
                    { city: { contains: query, mode: "insensitive" } },
                ],
                ...(country && {
                    country: { contains: country, mode: "insensitive" },
                }),
            },
            include: {
                images: true,
            },
        });
    }
    if (!type || type === "package") {
        packages = await prisma.travelPackage.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { description: { contains: query, mode: "insensitive" } },
                ],
                ...(minPrice && { price: { gte: Number.parseFloat(minPrice) } }),
                ...(maxPrice && { price: { lte: Number.parseFloat(maxPrice) } }),
                ...(country && {
                    destinations: {
                        some: {
                            country: { contains: country, mode: "insensitive" },
                        },
                    },
                }),
            },
            include: {
                images: true,
                agency: {
                    select: {
                        id: true,
                        agency_name: true,
                        rating: true,
                    },
                },
                destinations: {
                    select: {
                        id: true,
                        name: true,
                        country: true,
                    },
                },
            },
        });
    }
    if (!type || type === "service") {
        services = await prisma.service.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { description: { contains: query, mode: "insensitive" } },
                    { category: { contains: query, mode: "insensitive" } },
                ],
                ...(minPrice && { price: { gte: Number.parseFloat(minPrice) } }),
                ...(maxPrice && { price: { lte: Number.parseFloat(maxPrice) } }),
            },
            include: {
                images: true,
                provider: {
                    select: {
                        id: true,
                        business_name: true,
                        rating: true,
                    },
                },
            },
        });
    }
    res.status(200).json({
        success: true,
        data: {
            destinations,
            packages,
            services,
        },
    });
}));
//# sourceMappingURL=publicRoutes.js.map
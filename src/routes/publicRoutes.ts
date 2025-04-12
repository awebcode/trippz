import express, { type Request, type Response } from "express";
import { DestinationController } from "../controllers/destinationController";
import { TravelAgencyService } from "../services/travelAgencyService";
import { ServiceProviderService } from "../services/serviceProviderService";
import { catchAsync } from "../utils/catchAsync";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// Destinations
router.get("/destinations", DestinationController.getDestinations);
router.get("/destinations/:id", DestinationController.getDestinationById);

// Packages
router.get(
  "/packages",
  catchAsync(async (req: Request, res: Response) => {
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
  })
);

router.get(
  "/packages/:id",
  catchAsync(async (req: Request, res: Response) => {
    const packageId = req.params.id;
    const travelPackage = await TravelAgencyService.getPackageById(packageId);

    res.status(200).json({
      success: true,
      data: travelPackage,
    });
  })
);

// Services
router.get(
  "/services",
  catchAsync(async (req: Request, res: Response) => {
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
  })
);

router.get(
  "/services/:id",
  catchAsync(async (req: Request, res: Response) => {
    const serviceId = req.params.id;
    const service = await ServiceProviderService.getServiceById(serviceId);

    res.status(200).json({
      success: true,
      data: service,
    });
  })
);

// Search
router.get(
  "/search",
  catchAsync(async (req: Request, res: Response) => {
    const { query, type, country, minPrice, maxPrice } = req.query;

    let destinations: any = [];
    let packages: any = [];
    let services: any = [];

    if (!type || type === "destination") {
      destinations = await prisma.destination.findMany({
        where: {
          OR: [
            { name: { contains: query as string, mode: "insensitive" } },
            { country: { contains: query as string, mode: "insensitive" } },
            { city: { contains: query as string, mode: "insensitive" } },
          ],
          ...(country && {
            country: { contains: country as string, mode: "insensitive" },
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
            { name: { contains: query as string, mode: "insensitive" } },
            { description: { contains: query as string, mode: "insensitive" } },
          ],
          ...(minPrice && { price: { gte: Number.parseFloat(minPrice as string) } }),
          ...(maxPrice && { price: { lte: Number.parseFloat(maxPrice as string) } }),
          ...(country && {
            destinations: {
              some: {
                country: { contains: country as string, mode: "insensitive" },
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
            { name: { contains: query as string, mode: "insensitive" } },
            { description: { contains: query as string, mode: "insensitive" } },
            { category: { contains: query as string, mode: "insensitive" } },
          ],
          ...(minPrice && { price: { gte: Number.parseFloat(minPrice as string) } }),
          ...(maxPrice && { price: { lte: Number.parseFloat(maxPrice as string) } }),
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
  })
);

export { router as publicRoutes };

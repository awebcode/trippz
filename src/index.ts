import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFoundHandler";
import { maintenanceMiddleware } from "./middleware/maintenanceMiddleware";
import { authRoutes } from "./routes/authRoutes";
import { userRoutes } from "./routes/userRoutes";
import { hotelRoutes } from "./routes/hotelRoutes";
import { flightRoutes } from "./routes/flightRoutes";
import { tripRoutes } from "./routes/tripRoutes";
import { bookingRoutes } from "./routes/bookingRoutes";
import { paymentRoutes } from "./routes/paymentRoutes";
import { reviewRoutes } from "./routes/reviewRoutes";
import { serviceProviderRoutes } from "./routes/serviceProviderRoutes";
import { travelAgencyRoutes } from "./routes/travelAgencyRoutes";
import { destinationRoutes } from "./routes/destinationRoutes";
import { notificationRoutes } from "./routes/notificationRoutes";
import { adminRoutes } from "./routes/adminRoutes";
import { logger } from "./utils/logger";
import { prisma } from "./lib/prisma";
import { optionalAuth } from "./middleware/authMiddleware";
import rateLimit from "express-rate-limit";
import { config } from "./config";

// Load environment variables
dotenv.config();

// Load Swagger document
const swaggerDocument = YAML.load(path.join(__dirname, "../swagger.yaml"));

// Create Express app
const app = express();

// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

// Apply rate limiting to API routes
app.use("/api/v1", apiLimiter);

// Middleware
app.use(helmet()); // Security headers
app.use(
  compression({
    threshold: 1024, // Only compress responses > 1KB
    level: 6, // Moderate compression level
    filter: (req, res) => {
      // Skip compression for Swagger UI and binary content
      if (req.path.startsWith("/api/v1/api-docs")) {
        return false;
      }
      const contentType = res.getHeader("Content-Type") || "";
      if (typeof contentType === "string" && /image|video|audio/.test(contentType)) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);
app.use(morgan("dev")); // HTTP request logger
app.use(express.json({ limit: "100mb" })); // Parse JSON request body
app.use(express.urlencoded({ extended: true, limit: "100mb" })); // Parse URL-encoded request body
app.use(cookieParser()); // Parse cookies

// CORS configuration for web and mobile clients
const corsOptions = {
  origin: (origin: any, callback: any) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL || "http://localhost:5000",
      process.env.MOBILE_APP_URL || "capacitor://localhost",
      "http://localhost:3000",
      "http://localhost:8100", // Ionic default
      "ionic://localhost",
      "capacitor://localhost",
      "app://localhost", // Flutter
      "http://localhost", // Additional mobile origin
    ];
    // Allow requests with no origin (e.g., mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked for origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["X-Access-Token", "X-Refresh-Token"],
};
app.use(cors(corsOptions));

// Health check endpoint
app.get(["/", "/health"], (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// Maintenance status endpoint
app.get("/api/v1/maintenance-status", (req, res) => {
  prisma.systemSetting
    .findFirst()
    .then((settings) => {
      res.status(200).json({
        status: "success",
        data: {
          maintenance_mode: settings?.maintenance_mode || false,
          message: settings?.maintenance_mode
            ? "System is currently under maintenance"
            : "System is operational",
        },
      });
    })
    .catch((error) => {
      logger.error(`Error checking maintenance status: ${error}`);
      res.status(500).json({
        status: "error",
        message: "Failed to check maintenance status",
      });
    });
});

// Apply maintenance middleware
app.use(maintenanceMiddleware);

// API documentation
app.use("/api/v1/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Optional auth for public routes
app.use("/api/v1/public", optionalAuth);

// API routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/hotels", hotelRoutes);
app.use("/api/v1/flights", flightRoutes);
app.use("/api/v1/trips", tripRoutes);
app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/providers", serviceProviderRoutes);
app.use("/api/v1/agencies", travelAgencyRoutes);
app.use("/api/v1/destinations", destinationRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/admin", adminRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on ${config.apiUrl}`);
  logger.info(`API documentation available at ${config.apiUrl}/api/v1/api-docs`);
});

// Handle uncaught exceptions and unhandled rejections
process.on("uncaughtException", (error) => {
  logger.error("UNCAUGHT EXCEPTION! 💥", error);
  // Avoid immediate shutdown to allow recovery
});

process.on("unhandledRejection", (error) => {
  logger.error("UNHANDLED REJECTION! 💥", error);
  // Avoid immediate shutdown
});

export default app;

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
import { publicRoutes } from "./routes/publicRoutes";
import { logger } from "./utils/logger";
import { prisma } from "./lib/prisma";
import passport from "./config/passport";
// Load environment variables
dotenv.config();

// Load Swagger document
const swaggerDocument = YAML.load(path.join(__dirname, "../swagger.yaml"));

// Create Express app
const app = express();

// Set trust proxy for secure cookies in production
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(morgan("dev")); // HTTP request logger
app.use(express.json({ limit: "10mb" })); // Parse JSON request body
app.use(express.urlencoded({ extended: true, limit: "10mb" })); // Parse URL-encoded request body
app.use(cookieParser()); // Parse cookies
app.use(passport.initialize());

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5000",
  credentials: true,
  optionsSuccessStatus: 200,
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
app.use("/api/v1/", publicRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port http://localhost:${PORT}`);
});

export default app;

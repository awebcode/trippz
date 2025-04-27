"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
const path_1 = __importDefault(require("path"));
const errorHandler_1 = require("./middleware/errorHandler");
const notFoundHandler_1 = require("./middleware/notFoundHandler");
const maintenanceMiddleware_1 = require("./middleware/maintenanceMiddleware");
const authRoutes_1 = require("./routes/authRoutes");
const userRoutes_1 = require("./routes/userRoutes");
const hotelRoutes_1 = require("./routes/hotelRoutes");
const flightRoutes_1 = require("./routes/flightRoutes");
const tripRoutes_1 = require("./routes/tripRoutes");
const bookingRoutes_1 = require("./routes/bookingRoutes");
const paymentRoutes_1 = require("./routes/paymentRoutes");
const reviewRoutes_1 = require("./routes/reviewRoutes");
const serviceProviderRoutes_1 = require("./routes/serviceProviderRoutes");
const travelAgencyRoutes_1 = require("./routes/travelAgencyRoutes");
const destinationRoutes_1 = require("./routes/destinationRoutes");
const notificationRoutes_1 = require("./routes/notificationRoutes");
const adminRoutes_1 = require("./routes/adminRoutes");
const logger_1 = require("./utils/logger");
const prisma_1 = require("./lib/prisma");
const authMiddleware_1 = require("./middleware/authMiddleware");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Load environment variables
dotenv_1.default.config();
// Load Swagger document
const swaggerDocument = yamljs_1.default.load(path_1.default.join(__dirname, "../swagger.yaml"));
// Create Express app
const app = (0, express_1.default)();
// Set trust proxy for secure cookies in production
if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}
// Rate limiting middleware
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        success: false,
        message: "Too many requests, please try again later.",
    },
});
// Apply rate limiting to all routes
app.use("/api/v1", apiLimiter);
// Middleware
app.use((0, helmet_1.default)()); // Security headers
app.use((0, compression_1.default)()); // Compress responses
app.use((0, morgan_1.default)("dev")); // HTTP request logger
app.use(express_1.default.json({ limit: "10mb" })); // Parse JSON request body
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" })); // Parse URL-encoded request body
app.use((0, cookie_parser_1.default)()); // Parse cookies
// CORS configuration - Allow mobile apps and web clients
const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [
            process.env.FRONTEND_URL || "http://localhost:5000",
            process.env.MOBILE_APP_URL || "capacitor://localhost",
            "http://localhost:3000",
            "http://localhost:8100", // Ionic default
            "ionic://localhost",
            "capacitor://localhost",
        ];
        // Allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["X-Access-Token", "X-Refresh-Token"], // Expose custom headers for mobile apps
};
app.use((0, cors_1.default)(corsOptions));
// Health check endpoint
app.get(["/", "/health"], (req, res) => {
    res.status(200).json({ status: "ok", message: "Server is running" });
});
// Maintenance status endpoint
app.get("/api/v1/maintenance-status", (req, res) => {
    prisma_1.prisma.systemSetting
        .findFirst()
        .then((settings) => {
        res.status(200).json({
            status: "success",
            data: {
                maintenance_mode: settings?.maintenance_mode || false,
                message: settings?.maintenance_mode ? "System is currently under maintenance" : "System is operational",
            },
        });
    })
        .catch((error) => {
        logger_1.logger.error(`Error checking maintenance status: ${error}`);
        res.status(500).json({
            status: "error",
            message: "Failed to check maintenance status",
        });
    });
});
// Apply maintenance middleware
app.use(maintenanceMiddleware_1.maintenanceMiddleware);
// API documentation
app.use("/api/v1/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
// Optional auth for public routes that might need user info
app.use("/api/v1/public", authMiddleware_1.optionalAuth);
// API routes
app.use("/api/v1/auth", authRoutes_1.authRoutes);
app.use("/api/v1/users", userRoutes_1.userRoutes);
app.use("/api/v1/hotels", hotelRoutes_1.hotelRoutes);
app.use("/api/v1/flights", flightRoutes_1.flightRoutes);
app.use("/api/v1/trips", tripRoutes_1.tripRoutes);
app.use("/api/v1/bookings", bookingRoutes_1.bookingRoutes);
app.use("/api/v1/payments", paymentRoutes_1.paymentRoutes);
app.use("/api/v1/reviews", reviewRoutes_1.reviewRoutes);
app.use("/api/v1/providers", serviceProviderRoutes_1.serviceProviderRoutes);
app.use("/api/v1/agencies", travelAgencyRoutes_1.travelAgencyRoutes);
app.use("/api/v1/destinations", destinationRoutes_1.destinationRoutes);
app.use("/api/v1/notifications", notificationRoutes_1.notificationRoutes);
app.use("/api/v1/admin", adminRoutes_1.adminRoutes);
// Error handling middleware
app.use(notFoundHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
// Background tasks to keep server alive on free hosting
const keepAlive = async () => {
    if (process.env.NODE_ENV === "production") {
        // Ping database every minute to keep connection alive
        setInterval(async () => {
            try {
                await prisma_1.prisma.$queryRaw `SELECT 1`;
                logger_1.logger.info("Keep-alive task: Database ping successful");
            }
            catch (error) {
                logger_1.logger.error(`Keep-alive task failed: ${error}`);
            }
        }, 1 * 60 * 1000);
        // Self-ping the server every 10 minutes to prevent free hosting sleep
        if (process.env.APP_URL) {
            setInterval(async () => {
                try {
                    const response = await fetch(`${process.env.APP_URL}/health`);
                    if (response.ok) {
                        logger_1.logger.info("Keep-alive task: Server self-ping successful");
                    }
                    else {
                        logger_1.logger.warn(`Keep-alive task: Server self-ping failed with status ${response.status}`);
                    }
                }
                catch (error) {
                    logger_1.logger.error(`Keep-alive self-ping failed: ${error}`);
                }
            }, 10 * 60 * 1000);
        }
    }
};
// Start keep-alive task
keepAlive();
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    logger_1.logger.info(`Server running on port http://localhost:${PORT}`);
    logger_1.logger.info(`API documentation available at http://localhost:${PORT}/api/v1/api-docs`);
});
// Handle uncaught exceptions and unhandled rejections
process.on("uncaughtException", (error) => {
    logger_1.logger.error("UNCAUGHT EXCEPTION! 💥 Shutting down...", error);
    process.exit(1);
});
process.on("unhandledRejection", (error) => {
    logger_1.logger.error("UNHANDLED REJECTION! 💥 Shutting down...", error);
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=index.js.map
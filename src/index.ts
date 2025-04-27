import dotenv from "dotenv"
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import compression from "compression"
import morgan from "morgan"
import swaggerUi from "swagger-ui-express"
import YAML from "yamljs"
import path from "path"
import { errorHandler } from "./middleware/errorHandler"
import { notFoundHandler } from "./middleware/notFoundHandler"
import { maintenanceMiddleware } from "./middleware/maintenanceMiddleware"
import { authRoutes } from "./routes/authRoutes"
import { userRoutes } from "./routes/userRoutes"
import { hotelRoutes } from "./routes/hotelRoutes"
import { flightRoutes } from "./routes/flightRoutes"
import { tripRoutes } from "./routes/tripRoutes"
import { bookingRoutes } from "./routes/bookingRoutes"
import { paymentRoutes } from "./routes/paymentRoutes"
import { reviewRoutes } from "./routes/reviewRoutes"
import { serviceProviderRoutes } from "./routes/serviceProviderRoutes"
import { travelAgencyRoutes } from "./routes/travelAgencyRoutes"
import { destinationRoutes } from "./routes/destinationRoutes"
import { notificationRoutes } from "./routes/notificationRoutes"
import { adminRoutes } from "./routes/adminRoutes"
import { logger } from "./utils/logger"
import { prisma } from "./lib/prisma"
import { optionalAuth } from "./middleware/authMiddleware"
import rateLimit from "express-rate-limit"

// Load environment variables
dotenv.config()

// Load Swagger document
const swaggerDocument = YAML.load(path.join(__dirname, "../swagger.yaml"))

// Create Express app
const app = express()



// Rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
})

// Apply rate limiting to all routes
app.use("/api/v1", apiLimiter)

// Middleware
app.use(helmet()) // Security headers
// Middleware
// Middleware
// app.use((req, res, next) => {
//   // Skip compression for Swagger UI
//   if (req.path.startsWith("/api/v1/api-docs")) {
//     return next();
//   }
//   return compression()(req, res, next);
// });
app.use(morgan("dev")) // HTTP request logger
app.use(express.json({ limit: "10mb" })) // Parse JSON request body
app.use(express.urlencoded({ extended: true, limit: "10mb" })) // Parse URL-encoded request body
app.use(cookieParser()) // Parse cookies

// CORS configuration - Allow mobile apps and web clients
const corsOptions = {
  origin: (origin:any, callback:any) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL || "http://localhost:5000",
      process.env.MOBILE_APP_URL || "capacitor://localhost",
      "http://localhost:3000",
      "http://localhost:8100", // Ionic default
      "ionic://localhost",
      "capacitor://localhost",
    ]

    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["X-Access-Token", "X-Refresh-Token"], // Expose custom headers for mobile apps
}
app.use(cors(corsOptions))

// Health check endpoint
app.get(["/", "/health"], (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" })
})

// Maintenance status endpoint
app.get("/api/v1/maintenance-status", (req, res) => {
  prisma.systemSetting
    .findFirst()
    .then((settings) => {
      res.status(200).json({
        status: "success",
        data: {
          maintenance_mode: settings?.maintenance_mode || false,
          message: settings?.maintenance_mode ? "System is currently under maintenance" : "System is operational",
        },
      })
    })
    .catch((error) => {
      logger.error(`Error checking maintenance status: ${error}`)
      res.status(500).json({
        status: "error",
        message: "Failed to check maintenance status",
      })
    })
})

// Apply maintenance middleware
app.use(maintenanceMiddleware)

// API documentation
app.use("/api/v1/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Optional auth for public routes that might need user info
app.use("/api/v1/public", optionalAuth)

// API routes
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/hotels", hotelRoutes)
app.use("/api/v1/flights", flightRoutes)
app.use("/api/v1/trips", tripRoutes)
app.use("/api/v1/bookings", bookingRoutes)
app.use("/api/v1/payments", paymentRoutes)
app.use("/api/v1/reviews", reviewRoutes)
app.use("/api/v1/providers", serviceProviderRoutes)
app.use("/api/v1/agencies", travelAgencyRoutes)
app.use("/api/v1/destinations", destinationRoutes)
app.use("/api/v1/notifications", notificationRoutes)
app.use("/api/v1/admin", adminRoutes)

// Error handling middleware
app.use(notFoundHandler)
app.use(errorHandler)

// Background tasks to keep server alive on free hosting
const keepAlive = async () => {
  if (process.env.NODE_ENV === "production") {
    // Ping database every minute to keep connection alive
    setInterval(
      async () => {
        try {
          await prisma.$queryRaw`SELECT 1`
          logger.info("Keep-alive task: Database ping successful")
        } catch (error) {
          logger.error(`Keep-alive task failed: ${error}`)
        }
      },
      1 * 60 * 1000, // Run every 1 minute
    )

    // Self-ping the server every 10 minutes to prevent free hosting sleep
    if (process.env.APP_URL) {
      setInterval(
        async () => {
          try {
            const response = await fetch(`${process.env.APP_URL}/health`)
            if (response.ok) {
              logger.info("Keep-alive task: Server self-ping successful")
            } else {
              logger.warn(`Keep-alive task: Server self-ping failed with status ${response.status}`)
            }
          } catch (error) {
            logger.error(`Keep-alive self-ping failed: ${error}`)
          }
        },
        10 * 60 * 1000, // Run every 10 minutes
      )
    }
  }
}

// Start keep-alive task
keepAlive()

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  logger.info(`Server running on port http://localhost:${PORT}`)
  logger.info(`API documentation available at http://localhost:${PORT}/api/v1/api-docs`)
})

// Handle uncaught exceptions and unhandled rejections
process.on("uncaughtException", (error) => {
  logger.error("UNCAUGHT EXCEPTION! 💥 Shutting down...", error)
  process.exit(1)
})

process.on("unhandledRejection", (error) => {
  logger.error("UNHANDLED REJECTION! 💥 Shutting down...", error)
  process.exit(1)
})

export default app

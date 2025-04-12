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
import { adminRoutes } from "./routes/adminRoutes"
import { publicRoutes } from "./routes/publicRoutes"
import { logger } from "./utils/logger"

// Load Swagger document
const swaggerDocument = YAML.load(path.join(__dirname, "../swagger.yaml"))

// Create Express app
const app = express()

// Set trust proxy for secure cookies in production
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1)
}

// Middleware
app.use(helmet()) // Security headers
app.use(compression()) // Compress responses
app.use(morgan("dev")) // HTTP request logger
app.use(express.json({ limit: "10mb" })) // Parse JSON request body
app.use(express.urlencoded({ extended: true, limit: "10mb" })) // Parse URL-encoded request body
app.use(cookieParser()) // Parse cookies

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200,
}
app.use(cors(corsOptions))

// API routes
const apiRouter = express.Router()

// Health check endpoint
apiRouter.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" })
})

// API documentation
apiRouter.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// API routes
apiRouter.use("/auth", authRoutes)
apiRouter.use("/users", userRoutes)
apiRouter.use("/hotels", hotelRoutes)
apiRouter.use("/flights", flightRoutes)
apiRouter.use("/trips", tripRoutes)
apiRouter.use("/bookings", bookingRoutes)
apiRouter.use("/payments", paymentRoutes)
apiRouter.use("/reviews", reviewRoutes)
apiRouter.use("/providers", serviceProviderRoutes)
apiRouter.use("/agencies", travelAgencyRoutes)
apiRouter.use("/admin", adminRoutes)
apiRouter.use("/", publicRoutes)

// Mount API router
app.use("/api", apiRouter)

// Error handling middleware
app.use(notFoundHandler)
app.use(errorHandler)

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})

export default app

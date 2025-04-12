import express from "express"
import cors from "cors"
import helmet from "helmet"
import compression from "compression"
import { config } from "dotenv"
import { logger } from "./utils/logger"
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
import morgan from "morgan"
import cookieParser from "cookie-parser"
import passport from "./config/passport"
import swaggerUi from "swagger-ui-express"
import YAML from "yamljs"
import path from "path"
// Load environment variables
config()

const app = express()
const PORT = process.env.PORT || 3000

// Load Swagger document
const swaggerDocument = YAML.load(path.join(__dirname, "../swagger.yaml"))

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  }),
)
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan("dev"))
app.use(passport.initialize())

// Serve static files
app.use(express.static(path.join(__dirname, "../public")))

// API documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  explorer: true,
  isExplorer: true
}))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/hotels", hotelRoutes)
app.use("/api/flights", flightRoutes)
app.use("/api/trips", tripRoutes)
app.use("/api/bookings", bookingRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/reviews", reviewRoutes)
// Error handling
app.use(notFoundHandler)
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`)
})

export default app

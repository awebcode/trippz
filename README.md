# Trippz Backend API - Comprehensive Documentation

A production-ready backend API for the Trippz travel application built with Node.js, Express, TypeScript, and Prisma, optimized for Bun runtime.

## Table of Contents

- [Project Overview](#project-overview)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
- [Database](#database)
  - [Schema Overview](#schema-overview)
  - [Migrations](#migrations)
  - [Seeding](#seeding)
- [API Documentation](#api-documentation)
  - [Authentication](#authentication)
  - [Users](#users)
  - [Hotels](#hotels)
  - [Flights](#flights)
  - [Trips](#trips)
  - [Bookings](#bookings)
  - [Payments](#payments)
  - [Reviews](#reviews)
  - [Service Providers](#service-providers)
  - [Travel Agencies](#travel-agencies)
  - [Destinations](#destinations)
  - [Admin](#admin)
- [Core Utilities](#core-utilities)
  - [Error Handling](#error-handling)
  - [Authentication Utilities](#authentication-utilities)
  - [File Upload](#file-upload)
  - [Email Service](#email-service)
  - [SMS Service](#sms-service)
  - [Validation](#validation)
  - [Logging](#logging)
- [Middleware](#middleware)
  - [Authentication Middleware](#authentication-middleware)
  - [Validation Middleware](#validation-middleware)
  - [Error Handling Middleware](#error-handling-middleware)
  - [Role-Based Access Control](#role-based-access-control)
- [Testing](#testing)
- [Deployment](#deployment)
  - [Standard Deployment](#standard-deployment)
  - [Docker Deployment](#docker-deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Project Overview

Trippz is a comprehensive travel booking platform that connects travelers with service providers and travel agencies. The backend API provides all the necessary functionality for user management, travel services, bookings, payments, reviews, and notifications.

### Key Features

- **User Management**: Authentication, authorization, profile management
- **Travel Services**: Hotels, flights, trips, destinations
- **Booking System**: Multi-type bookings with status tracking
- **Payment Processing**: Multiple payment methods with refund handling
- **Reviews & Ratings**: User reviews for all service types
- **Notifications**: Email and SMS notifications

### Tech Stack

- **Runtime**: Bun
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT, Passport.js
- **File Storage**: Cloudinary
- **Email Service**: Resend
- **SMS Service**: Twilio
- **Payment Processing**: Stripe
- **Validation**: Zod
- **Documentation**: OpenAPI/Swagger
- **Logging**: Winston

## Project Structure

The project follows a modular architecture organized by feature and responsibility:

\`\`\`
trippz-backend/
├── prisma/                  # Database schema and migrations
│   ├── migrations/          # Database migrations
│   ├── schema.prisma        # Prisma schema definition
│   └── seed.ts              # Database seeding script
├── public/                  # Public assets
│   └── emails/              # Email templates
├── src/                     # Source code
│   ├── config/              # Configuration files
│   │   ├── passport.ts      # Passport.js configuration
│   │   └── ...
│   ├── controllers/         # Request handlers
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   └── ...
│   ├── middleware/          # Express middleware
│   │   ├── authMiddleware.ts
│   │   ├── errorHandler.ts
│   │   ├── validateRequest.ts
│   │   └── ...
│   ├── routes/              # API routes
│   │   ├── authRoutes.ts
│   │   ├── userRoutes.ts
│   │   └── ...
│   ├── services/            # Business logic
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   └── ...
│   ├── utils/               # Utility functions
│   │   ├── appError.ts
│   │   ├── catchAsync.ts
│   │   ├── email.ts
│   │   ├── fileUpload.ts
│   │   ├── logger.ts
│   │   ├── sms.ts
│   │   ├── tokens.ts
│   │   └── ...
│   ├── validators/          # Request validation schemas
│   │   ├── authValidators.ts
│   │   ├── userValidators.ts
│   │   └── ...
│   ├── lib/                 # Library code
│   │   └── prisma.ts        # Prisma client singleton
│   └── index.ts             # Application entry point
├── .env.example             # Example environment variables
├── .gitignore               # Git ignore file
├── package.json             # Project dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── swagger.yaml             # API documentation
\`\`\`

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.0.0+)
- PostgreSQL
- Cloudinary account
- Resend account
- Twilio account
- Stripe account
- Social auth provider accounts (optional)

### Installation

1. **Clone the repository**

   \`\`\`bash
   git clone https://github.com/yourusername/trippz-backend.git
   cd trippz-backend
   \`\`\`

2. **Install dependencies**

   \`\`\`bash
   bun install
   \`\`\`

3. **Set up environment variables**

   \`\`\`bash
   cp .env.example .env
   \`\`\`

   Then edit the `.env` file with your configuration.

4. **Set up the database**

   \`\`\`bash
   # Generate Prisma client
   bun prisma generate

   # Run database migrations
   bun prisma migrate dev

   # Seed the database
   bun prisma db seed
   \`\`\`

5. **Start the development server**

   \`\`\`bash
   bun dev
   \`\`\`

   The server will be available at `http://localhost:5000`.

### Environment Configuration

The application uses the following environment variables:

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 5000 |
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `JWT_SECRET` | Secret for JWT access tokens | Yes | - |
| `JWT_EXPIRES_IN` | JWT access token expiration | No | 1h |
| `JWT_REFRESH_SECRET` | Secret for JWT refresh tokens | Yes | - |
| `JWT_REFRESH_EXPIRES_IN` | JWT refresh token expiration | No | 90d |
| `USE_COOKIE_AUTH` | Use cookies for auth tokens | No | false |
| `RESEND_API_KEY` | Resend API key | Yes | - |
| `RESEND_FROM_EMAIL` | Email sender address | Yes | - |
| `FRONTEND_URL` | Frontend application URL | Yes | - |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes | - |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes | - |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes | - |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | Yes | - |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | Yes | - |
| `TWILIO_PHONE_NUMBER` | Twilio phone number | Yes | - |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes | - |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No | - |
| `FACEBOOK_APP_ID` | Facebook app ID | No | - |
| `FACEBOOK_APP_SECRET` | Facebook app secret | No | - |
| `APPLE_CLIENT_ID` | Apple client ID | No | - |
| `APPLE_TEAM_ID` | Apple team ID | No | - |
| `APPLE_KEY_ID` | Apple key ID | No | - |
| `APPLE_PRIVATE_KEY_LOCATION` | Path to Apple private key | No | - |

## Database

### Schema Overview

The database schema is defined in `prisma/schema.prisma` and includes the following main models:

- **User**: User accounts with authentication details
- **ServiceProvider**: Service providers offering travel services
- **TravelAgency**: Travel agencies offering travel packages
- **Hotel**: Hotel listings with details and availability
- **Flight**: Flight listings with details and availability
- **Trip**: Trip listings with details and itineraries
- **Service**: Services offered by service providers
- **TravelPackage**: Travel packages offered by travel agencies
- **Destination**: Travel destinations with details
- **Booking**: Bookings for hotels, flights, trips, services, or packages
- **Payment**: Payment records for bookings
- **Review**: User reviews for hotels, flights, trips, services, or packages
- **Address**: User and business addresses

### Migrations

Database migrations are managed by Prisma and stored in the `prisma/migrations` directory.

\`\`\`bash
# Create a new migration
bun prisma migrate dev --name "migration_name"

# Apply migrations in production
bun prisma migrate deploy
\`\`\`

### Seeding

The database seeding script is located at `prisma/seed.ts` and creates initial data for development and testing.

\`\`\`bash
# Run the seed script
bun prisma db seed
\`\`\`

The seed script creates:
- Users with different roles (admin, user, service provider, travel agency)
- Service providers with services
- Travel agencies with packages
- Hotels, flights, and trips
- Destinations
- Sample bookings and payments
- Sample reviews

## API Documentation

The API is documented using OpenAPI/Swagger and is available at `/api/docs` when the server is running.

### Authentication

#### Register a new user

\`\`\`
POST /api/auth/register
\`\`\`

Request body:
\`\`\`json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirm_password": "password123",
  "phone_number": "+1234567890" // Optional
}
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "user",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    },
    "tokens": {
      "access_token": "jwt_access_token",
      "refresh_token": "jwt_refresh_token"
    }
  }
}
\`\`\`

#### Login

\`\`\`
POST /api/auth/login
\`\`\`

Request body:
\`\`\`json
{
  "email": "john@example.com",
  "password": "password123"
}
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "user",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    },
    "tokens": {
      "access_token": "jwt_access_token",
      "refresh_token": "jwt_refresh_token"
    }
  }
}
\`\`\`

#### Refresh Token

\`\`\`
POST /api/auth/refresh-token
\`\`\`

Request body:
\`\`\`json
{
  "refresh_token": "jwt_refresh_token"
}
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "Token refreshed successfully",
  "data": {
    "access_token": "new_jwt_access_token",
    "refresh_token": "new_jwt_refresh_token"
  }
}
\`\`\`

#### Forgot Password

\`\`\`
POST /api/auth/forgot-password
\`\`\`

Request body:
\`\`\`json
{
  "email": "john@example.com"
}
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "Password reset email sent"
}
\`\`\`

#### Reset Password

\`\`\`
POST /api/auth/reset-password
\`\`\`

Request body:
\`\`\`json
{
  "token": "reset_token",
  "password": "new_password123",
  "confirm_password": "new_password123"
}
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "Password reset successful"
}
\`\`\`

#### Verify Email

\`\`\`
POST /api/auth/verify-email
\`\`\`

Request body:
\`\`\`json
{
  "token": "verification_token"
}
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "Email verified successfully"
}
\`\`\`

#### Social Authentication

\`\`\`
GET /api/auth/google
GET /api/auth/facebook
GET /api/auth/apple
\`\`\`

These endpoints redirect to the respective OAuth providers. After successful authentication, the user is redirected to the frontend with tokens.

### Users

#### Get User Profile

\`\`\`
GET /api/users/profile
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "data": {
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "phone_number": "+1234567890",
      "profile_picture": "https://cloudinary.com/profile.jpg",
      "role": "user",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z",
      "addresses": [
        {
          "id": "uuid",
          "street": "123 Main St",
          "city": "New York",
          "state": "NY",
          "postal_code": "10001",
          "country": "USA",
          "is_default": true
        }
      ]
    }
  }
}
\`\`\`

#### Update User Profile

\`\`\`
PUT /api/users/profile
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
\`\`\`

Request body:
\`\`\`json
{
  "first_name": "John",
  "last_name": "Smith",
  "phone_number": "+1234567890"
}
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Smith",
      "phone_number": "+1234567890",
      "profile_picture": "https://cloudinary.com/profile.jpg",
      "role": "user",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  }
}
\`\`\`

#### Update Password

\`\`\`
PUT /api/users/password
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
\`\`\`

Request body:
\`\`\`json
{
  "current_password": "password123",
  "new_password": "newpassword123",
  "confirm_password": "newpassword123"
}
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "Password updated successfully"
}
\`\`\`

#### Upload Profile Picture

\`\`\`
POST /api/users/profile-picture
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
Content-Type: multipart/form-data
\`\`\`

Request body:
\`\`\`
profile_picture: [file]
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "Profile picture uploaded successfully",
  "data": {
    "profile_picture": "https://cloudinary.com/new-profile.jpg"
  }
}
\`\`\`

#### Add Address

\`\`\`
POST /api/users/addresses
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
\`\`\`

Request body:
\`\`\`json
{
  "street": "123 Main St",
  "city": "New York",
  "state": "NY",
  "postal_code": "10001",
  "country": "USA",
  "is_default": true
}
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "Address added successfully",
  "data": {
    "address": {
      "id": "uuid",
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "postal_code": "10001",
      "country": "USA",
      "is_default": true,
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  }
}
\`\`\`

### Hotels

#### Get All Hotels

\`\`\`
GET /api/hotels
\`\`\`

Query parameters:
\`\`\`
page: 1
limit: 10
sort: price_per_night
order: asc
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "results": 10,
  "total": 100,
  "page": 1,
  "limit": 10,
  "data": {
    "hotels": [
      {
        "id": "uuid",
        "name": "Grand Hotel",
        "description": "Luxury hotel in the city center",
        "address": {
          "street": "123 Main St",
          "city": "New York",
          "state": "NY",
          "postal_code": "10001",
          "country": "USA"
        },
        "price_per_night": 200,
        "rating": 4.5,
        "amenities": ["WiFi", "Pool", "Spa"],
        "images": ["https://cloudinary.com/hotel1.jpg"],
        "created_at": "2023-01-01T00:00:00.000Z",
        "updated_at": "2023-01-01T00:00:00.000Z"
      },
      // More hotels...
    ]
  }
}
\`\`\`

#### Search Hotels

\`\`\`
GET /api/hotels/search
\`\`\`

Query parameters:
\`\`\`
location: New York
check_in: 2023-01-01
check_out: 2023-01-05
guests: 2
price_min: 100
price_max: 300
amenities: WiFi,Pool
rating: 4
page: 1
limit: 10
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "results": 5,
  "total": 20,
  "page": 1,
  "limit": 10,
  "data": {
    "hotels": [
      // Hotels matching search criteria
    ]
  }
}
\`\`\`

#### Get Hotel by ID

\`\`\`
GET /api/hotels/:id
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "data": {
    "hotel": {
      "id": "uuid",
      "name": "Grand Hotel",
      "description": "Luxury hotel in the city center",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "postal_code": "10001",
        "country": "USA"
      },
      "price_per_night": 200,
      "rating": 4.5,
      "amenities": ["WiFi", "Pool", "Spa"],
      "images": ["https://cloudinary.com/hotel1.jpg"],
      "rooms": [
        {
          "id": "uuid",
          "type": "Deluxe",
          "price": 250,
          "capacity": 2,
          "available": true
        },
        // More rooms...
      ],
      "reviews": [
        {
          "id": "uuid",
          "user": {
            "id": "uuid",
            "first_name": "John",
            "last_name": "Doe",
            "profile_picture": "https://cloudinary.com/profile.jpg"
          },
          "rating": 5,
          "comment": "Excellent hotel with great service",
          "created_at": "2023-01-01T00:00:00.000Z"
        },
        // More reviews...
      ],
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  }
}
\`\`\`

#### Create Hotel (Admin/Service Provider)

\`\`\`
POST /api/hotels
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
Content-Type: multipart/form-data
\`\`\`

Request body:
\`\`\`
name: Grand Hotel
description: Luxury hotel in the city center
street: 123 Main St
city: New York
state: NY
postal_code: 10001
country: USA
price_per_night: 200
amenities: WiFi,Pool,Spa
images: [files]
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "Hotel created successfully",
  "data": {
    "hotel": {
      "id": "uuid",
      "name": "Grand Hotel",
      // Other hotel details...
    }
  }
}
\`\`\`

#### Update Hotel (Admin/Service Provider)

\`\`\`
PUT /api/hotels/:id
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
\`\`\`

Request body:
\`\`\`json
{
  "name": "Grand Hotel Deluxe",
  "description": "Updated luxury hotel in the city center",
  "price_per_night": 250
}
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "Hotel updated successfully",
  "data": {
    "hotel": {
      "id": "uuid",
      "name": "Grand Hotel Deluxe",
      // Updated hotel details...
    }
  }
}
\`\`\`

#### Delete Hotel (Admin/Service Provider)

\`\`\`
DELETE /api/hotels/:id
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "Hotel deleted successfully"
}
\`\`\`

### Flights

#### Get All Flights

\`\`\`
GET /api/flights
\`\`\`

Query parameters:
\`\`\`
page: 1
limit: 10
sort: departure_time
order: asc
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "results": 10,
  "total": 100,
  "page": 1,
  "limit": 10,
  "data": {
    "flights": [
      {
        "id": "uuid",
        "flight_number": "AA123",
        "airline": "American Airlines",
        "departure_airport": "JFK",
        "arrival_airport": "LAX",
        "departure_city": "New York",
        "arrival_city": "Los Angeles",
        "departure_time": "2023-01-01T08:00:00.000Z",
        "arrival_time": "2023-01-01T11:00:00.000Z",
        "price": 300,
        "available_seats": 50,
        "created_at": "2023-01-01T00:00:00.000Z",
        "updated_at": "2023-01-01T00:00:00.000Z"
      },
      // More flights...
    ]
  }
}
\`\`\`

#### Search Flights

\`\`\`
GET /api/flights/search
\`\`\`

Query parameters:
\`\`\`
departure_airport: JFK
arrival_airport: LAX
departure_date: 2023-01-01
return_date: 2023-01-10
passengers: 2
price_min: 200
price_max: 500
airline: American Airlines
page: 1
limit: 10
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "results": 5,
  "total": 20,
  "page": 1,
  "limit": 10,
  "data": {
    "flights": [
      // Flights matching search criteria
    ]
  }
}
\`\`\`

#### Get Flight by ID

\`\`\`
GET /api/flights/:id
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "data": {
    "flight": {
      "id": "uuid",
      "flight_number": "AA123",
      "airline": "American Airlines",
      "departure_airport": "JFK",
      "arrival_airport": "LAX",
      "departure_city": "New York",
      "arrival_city": "Los Angeles",
      "departure_time": "2023-01-01T08:00:00.000Z",
      "arrival_time": "2023-01-01T11:00:00.000Z",
      "price": 300,
      "available_seats": 50,
      "amenities": ["WiFi", "Meal", "Entertainment"],
      "reviews": [
        {
          "id": "uuid",
          "user": {
            "id": "uuid",
            "first_name": "John",
            "last_name": "Doe",
            "profile_picture": "https://cloudinary.com/profile.jpg"
          },
          "rating": 4,
          "comment": "Good flight with on-time departure",
          "created_at": "2023-01-01T00:00:00.000Z"
        },
        // More reviews...
      ],
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  }
}
\`\`\`

#### Create Flight (Admin/Service Provider)

\`\`\`
POST /api/flights
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
\`\`\`

Request body:
\`\`\`json
{
  "flight_number": "AA123",
  "airline": "American Airlines",
  "departure_airport": "JFK",
  "arrival_airport": "LAX",
  "departure_city": "New York",
  "arrival_city": "Los Angeles",
  "departure_time": "2023-01-01T08:00:00.000Z",
  "arrival_time": "2023-01-01T11:00:00.000Z",
  "price": 300,
  "available_seats": 50,
  "amenities": ["WiFi", "Meal", "Entertainment"]
}
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "Flight created successfully",
  "data": {
    "flight": {
      "id": "uuid",
      "flight_number": "AA123",
      // Other flight details...
    }
  }
}
\`\`\`

#### Update Flight (Admin/Service Provider)

\`\`\`
PUT /api/flights/:id
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
\`\`\`

Request body:
\`\`\`json
{
  "price": 350,
  "available_seats": 45
}
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "Flight updated successfully",
  "data": {
    "flight": {
      "id": "uuid",
      "flight_number": "AA123",
      // Updated flight details...
    }
  }
}
\`\`\`

#### Delete Flight (Admin/Service Provider)

\`\`\`
DELETE /api/flights/:id
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "Flight deleted successfully"
}
\`\`\`

### Trips

#### Get All Trips

\`\`\`
GET /api/trips
\`\`\`

Query parameters:
\`\`\`
page: 1
limit: 10
sort: price
order: asc
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "results": 10,
  "total": 100,
  "page": 1,
  "limit": 10,
  "data": {
    "trips": [
      {
        "id": "uuid",
        "title": "European Adventure",
        "description": "Explore the best of Europe",
        "destination": "Europe",
        "duration": 14,
        "price": 2000,
        "start_date": "2023-01-01T00:00:00.000Z",
        "end_date": "2023-01-15T00:00:00.000Z",
        "max_travelers": 20,
        "available_spots": 10,
        "images": ["https://cloudinary.com/trip1.jpg"],
        "created_at": "2023-01-01T00:00:00.000Z",
        "updated_at": "2023-01-01T00:00:00.000Z"
      },
      // More trips...
    ]
  }
}
\`\`\`

#### Search Trips

\`\`\`
GET /api/trips/search
\`\`\`

Query parameters:
\`\`\`
destination: Europe
start_date: 2023-01-01
end_date: 2023-01-31
duration_min: 7
duration_max: 21
price_min: 1000
price_max: 3000
page: 1
limit: 10
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "results": 5,
  "total": 20,
  "page": 1,
  "limit": 10,
  "data": {
    "trips": [
      // Trips matching search criteria
    ]
  }
}
\`\`\`

#### Get Trip by ID

\`\`\`
GET /api/trips/:id
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "data": {
    "trip": {
      "id": "uuid",
      "title": "European Adventure",
      "description": "Explore the best of Europe",
      "destination": "Europe",
      "duration": 14,
      "price": 2000,
      "start_date": "2023-01-01T00:00:00.000Z",
      "end_date": "2023-01-15T00:00:00.000Z",
      "max_travelers": 20,
      "available_spots": 10,
      "images": ["https://cloudinary.com/trip1.jpg"],
      "itinerary": [
        {
          "day": 1,
          "title": "Arrival in Paris",
          "description": "Arrive in Paris and check into hotel"
        },
        // More itinerary items...
      ],
      "included": ["Accommodation", "Breakfast", "Tour Guide"],
      "not_included": ["Flights", "Lunch", "Dinner  ["Accommodation", "Breakfast", "Tour Guide"],
      "not_included": ["Flights", "Lunch", "Dinner"],
      "reviews": [
        {
          "id": "uuid",
          "user": {
            "id": "uuid",
            "first_name": "John",
            "last_name": "Doe",
            "profile_picture": "https://cloudinary.com/profile.jpg"
          },
          "rating": 5,
          "comment": "Amazing trip with great experiences",
          "created_at": "2023-01-01T00:00:00.000Z"
        },
        // More reviews...
      ],
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  }
}
\`\`\`

#### Create Trip (Admin/Service Provider)

\`\`\`
POST /api/trips
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
Content-Type: multipart/form-data
\`\`\`

Request body:
\`\`\`
title: European Adventure
description: Explore the best of Europe
destination: Europe
duration: 14
price: 2000
start_date: 2023-01-01
end_date: 2023-01-15
max_travelers: 20
itinerary: [{"day": 1, "title": "Arrival in Paris", "description": "Arrive in Paris and check into hotel"}]
included: Accommodation,Breakfast,Tour Guide
not_included: Flights,Lunch,Dinner
images: [files]
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "Trip created successfully",
  "data": {
    "trip": {
      "id": "uuid",
      "title": "European Adventure",
      // Other trip details...
    }
  }
}
\`\`\`

#### Update Trip (Admin/Service Provider)

\`\`\`
PUT /api/trips/:id
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
\`\`\`

Request body:
\`\`\`json
{
  "price": 2200,
  "available_spots": 15
}
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "Trip updated successfully",
  "data": {
    "trip": {
      "id": "uuid",
      "title": "European Adventure",
      // Updated trip details...
    }
  }
}
\`\`\`

#### Delete Trip (Admin/Service Provider)

\`\`\`
DELETE /api/trips/:id
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "Trip deleted successfully"
}
\`\`\`

### Bookings

#### Create Booking

\`\`\`
POST /api/bookings
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
\`\`\`

Request body:
\`\`\`json
{
  "booking_type": "hotel",
  "hotel_id": "uuid",
  "check_in": "2023-01-01",
  "check_out": "2023-01-05",
  "guests": 2,
  "special_requests": "Room with a view"
}
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "Booking created successfully",
  "data": {
    "booking": {
      "id": "uuid",
      "booking_type": "hotel",
      "status": "pending",
      "hotel": {
        "id": "uuid",
        "name": "Grand Hotel",
        "image": "https://cloudinary.com/hotel1.jpg"
      },
      "check_in": "2023-01-01T00:00:00.000Z",
      "check_out": "2023-01-05T00:00:00.000Z",
      "guests": 2,
      "total_price": 800,
      "special_requests": "Room with a view",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  }
}
\`\`\`

#### Get User Bookings

\`\`\`
GET /api/bookings
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
\`\`\`

Query parameters:
\`\`\`
status: confirmed
booking_type: hotel
page: 1
limit: 10
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "results": 5,
  "total": 15,
  "page": 1,
  "limit": 10,
  "data": {
    "bookings": [
      {
        "id": "uuid",
        "booking_type": "hotel",
        "status": "confirmed",
        "hotel": {
          "id": "uuid",
          "name": "Grand Hotel",
          "image": "https://cloudinary.com/hotel1.jpg"
        },
        "check_in": "2023-01-01T00:00:00.000Z",
        "check_out": "2023-01-05T00:00:00.000Z",
        "guests": 2,
        "total_price": 800,
        "created_at": "2023-01-01T00:00:00.000Z",
        "updated_at": "2023-01-01T00:00:00.000Z"
      },
      // More bookings...
    ]
  }
}
\`\`\`

#### Get Booking by ID

\`\`\`
GET /api/bookings/:id
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "data": {
    "booking": {
      "id": "uuid",
      "booking_type": "hotel",
      "status": "confirmed",
      "hotel": {
        "id": "uuid",
        "name": "Grand Hotel",
        "address": {
          "street": "123 Main St",
          "city": "New York",
          "state": "NY",
          "postal_code": "10001",
          "country": "USA"
        },
        "image": "https://cloudinary.com/hotel1.jpg"
      },
      "check_in": "2023-01-01T00:00:00.000Z",
      "check_out": "2023-01-05T00:00:00.000Z",
      "guests": 2,
      "total_price": 800,
      "special_requests": "Room with a view",
      "payment": {
        "id": "uuid",
        "amount": 800,
        "status": "completed",
        "payment_method": "credit_card",
        "created_at": "2023-01-01T00:00:00.000Z"
      },
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  }
}
\`\`\`

#### Update Booking

\`\`\`
PUT /api/bookings/:id
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
\`\`\`

Request body:
\`\`\`json
{
  "check_in": "2023-01-02",
  "check_out": "2023-01-06",
  "guests": 3,
  "special_requests": "Room with a view and extra bed"
}
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "Booking updated successfully",
  "data": {
    "booking": {
      "id": "uuid",
      "booking_type": "hotel",
      // Updated booking details...
    }
  }
}
\`\`\`

#### Cancel Booking

\`\`\`
DELETE /api/bookings/:id
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "Booking cancelled successfully"
}
\`\`\`

### Payments

#### Process Payment

\`\`\`
POST /api/payments
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
\`\`\`

Request body:
\`\`\`json
{
  "booking_id": "uuid",
  "payment_method": "credit_card",
  "card_number": "4242424242424242",
  "expiry_month": "12",
  "expiry_year": "2025",
  "cvc": "123"
}
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "Payment processed successfully",
  "data": {
    "payment": {
      "id": "uuid",
      "amount": 800,
      "status": "completed",
      "payment_method": "credit_card",
      "booking_id": "uuid",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  }
}
\`\`\`

#### Get User Payments

\`\`\`
GET /api/payments
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
\`\`\`

Query parameters:
\`\`\`
status: completed
page: 1
limit: 10
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "results": 5,
  "total": 15,
  "page": 1,
  "limit": 10,
  "data": {
    "payments": [
      {
        "id": "uuid",
        "amount": 800,
        "status": "completed",
        "payment_method": "credit_card",
        "booking": {
          "id": "uuid",
          "booking_type": "hotel",
          "hotel": {
            "id": "uuid",
            "name": "Grand Hotel"
          }
        },
        "created_at": "2023-01-01T00:00:00.000Z",
        "updated_at": "2023-01-01T00:00:00.000Z"
      },
      // More payments...
    ]
  }
}
\`\`\`

#### Get Payment by ID

\`\`\`
GET /api/payments/:id
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "data": {
    "payment": {
      "id": "uuid",
      "amount": 800,
      "status": "completed",
      "payment_method": "credit_card",
      "booking": {
        "id": "uuid",
        "booking_type": "hotel",
        "hotel": {
          "id": "uuid",
          "name": "Grand Hotel"
        },
        "check_in": "2023-01-01T00:00:00.000Z",
        "check_out": "2023-01-05T00:00:00.000Z"
      },
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  }
}
\`\`\`

#### Refund Payment

\`\`\`
POST /api/payments/:id/refund
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
\`\`\`

Request body:
\`\`\`json
{
  "amount": 800,
  "reason": "Booking cancelled"
}
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "Payment refunded successfully",
  "data": {
    "refund": {
      "id": "uuid",
      "amount": 800,
      "status": "completed",
      "reason": "Booking cancelled",
      "payment_id": "uuid",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  }
}
\`\`\`

### Reviews

#### Create Review

\`\`\`
POST /api/reviews
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
\`\`\`

Request body:
\`\`\`json
{
  "review_type": "hotel",
  "hotel_id": "uuid",
  "rating": 5,
  "comment": "Excellent hotel with great service"
}
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "Review created successfully",
  "data": {
    "review": {
      "id": "uuid",
      "review_type": "hotel",
      "hotel": {
        "id": "uuid",
        "name": "Grand Hotel"
      },
      "rating": 5,
      "comment": "Excellent hotel with great service",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  }
}
\`\`\`

#### Get Hotel Reviews

\`\`\`
GET /api/reviews/hotels/:id
\`\`\`

Query parameters:
\`\`\`
rating: 5
page: 1
limit: 10
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "results": 5,
  "total": 15,
  "page": 1,
  "limit": 10,
  "data": {
    "reviews": [
      {
        "id": "uuid",
        "user": {
          "id": "uuid",
          "first_name": "John",
          "last_name": "Doe",
          "profile_picture": "https://cloudinary.com/profile.jpg"
        },
        "rating": 5,
        "comment": "Excellent hotel with great service",
        "created_at": "2023-01-01T00:00:00.000Z",
        "updated_at": "2023-01-01T00:00:00.000Z"
      },
      // More reviews...
    ]
  }
}
\`\`\`

#### Get User Reviews

\`\`\`
GET /api/reviews/user
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
\`\`\`

Query parameters:
\`\`\`
review_type: hotel
page: 1
limit: 10
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "results": 5,
  "total": 15,
  "page": 1,
  "limit": 10,
  "data": {
    "reviews": [
      {
        "id": "uuid",
        "review_type": "hotel",
        "hotel": {
          "id": "uuid",
          "name": "Grand Hotel",
          "image": "https://cloudinary.com/hotel1.jpg"
        },
        "rating": 5,
        "comment": "Excellent hotel with great service",
        "created_at": "2023-01-01T00:00:00.000Z",
        "updated_at": "2023-01-01T00:00:00.000Z"
      },
      // More reviews...
    ]
  }
}
\`\`\`

#### Update Review

\`\`\`
PUT /api/reviews/:id
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
\`\`\`

Request body:
\`\`\`json
{
  "rating": 4,
  "comment": "Very good hotel with friendly staff"
}
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "Review updated successfully",
  "data": {
    "review": {
      "id": "uuid",
      "review_type": "hotel",
      // Updated review details...
    }
  }
}
\`\`\`

#### Delete Review

\`\`\`
DELETE /api/reviews/:id
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "Review deleted successfully"
}
\`\`\`

### Service Providers

#### Register as Service Provider

\`\`\`
POST /api/service-providers
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
Content-Type: multipart/form-data
\`\`\`

Request body:
\`\`\`
company_name: Travel Services Inc.
description: Providing quality travel services
business_type: hotel
license_number: ABC123456
street: 123 Main St
city: New York
state: NY
postal_code: 10001
country: USA
contact_email: info@travelservices.com
contact_phone: +1234567890
website: https://travelservices.com
logo: [file]
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "Service provider registered successfully",
  "data": {
    "service_provider": {
      "id": "uuid",
      "company_name": "Travel Services Inc.",
      // Other service provider details...
    }
  }
}
\`\`\`

#### Get All Service Providers

\`\`\`
GET /api/service-providers
\`\`\`

Query parameters:
\`\`\`
business_type: hotel
page: 1
limit: 10
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "results": 5,
  "total": 15,
  "page": 1,
  "limit": 10,
  "data": {
    "service_providers": [
      {
        "id": "uuid",
        "company_name": "Travel Services Inc.",
        "description": "Providing quality travel services",
        "business_type": "hotel",
        "logo": "https://cloudinary.com/logo1.jpg",
        "rating": 4.5,
        "created_at": "2023-01-01T00:00:00.000Z",
        "updated_at": "2023-01-01T00:00:00.000Z"
      },
      // More service providers...
    ]
  }
}
\`\`\`

#### Get Service Provider by ID

\`\`\`
GET /api/service-providers/:id
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "data": {
    "service_provider": {
      "id": "uuid",
      "company_name": "Travel Services Inc.",
      "description": "Providing quality travel services",
      "business_type": "hotel",
      "license_number": "ABC123456",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "postal_code": "10001",
        "country": "USA"
      },
      "contact_email": "info@travelservices.com",
      "contact_phone": "+1234567890",
      "website": "https://travelservices.com",
      "logo": "https://cloudinary.com/logo1.jpg",
      "rating": 4.5,
      "services": [
        {
          "id": "uuid",
          "name": "Hotel Booking",
          "description": "Book hotels worldwide",
          "price": 50
        },
        // More services...
      ],
      "reviews": [
        {
          "id": "uuid",
          "user": {
            "id": "uuid",
            "first_name": "John",
            "last_name": "Doe",
            "profile_picture": "https://cloudinary.com/profile.jpg"
          },
          "rating": 5,
          "comment": "Excellent service provider",
          "created_at": "2023-01-01T00:00:00.000Z"
        },
        // More reviews...
      ],
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  }
}
\`\`\`

#### Update Service Provider

\`\`\`
PUT /api/service-providers/:id
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
\`\`\`

Request body:
\`\`\`json
{
  "company_name": "Travel Services International",
  "description": "Providing premium quality travel services worldwide",
  "website": "https://travelservicesinternational.com"
}
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "Service provider updated successfully",
  "data": {
    "service_provider": {
      "id": "uuid",
      "company_name": "Travel Services International",
      // Updated service provider details...
    }
  }
}
\`\`\`

#### Delete Service Provider

\`\`\`
DELETE /api/service-providers/:id
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "Service provider deleted successfully"
}
\`\`\`

### Travel Agencies

#### Register as Travel Agency

\`\`\`
POST /api/travel-agencies
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
Content-Type: multipart/form-data
\`\`\`

Request body:
\`\`\`
agency_name: Global Travels
description: Your global travel partner
license_number: XYZ789012
street: 456 Park Ave
city: New York
state: NY
postal_code: 10002
country: USA
contact_email: info@globaltravels.com
contact_phone: +1234567890
website: https://globaltravels.com
logo: [file]
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "Travel agency registered successfully",
  "data": {
    "travel_agency": {
      "id": "uuid",
      "agency_name": "Global Travels",
      // Other travel agency details...
    }
  }
}
\`\`\`

#### Get All Travel Agencies

\`\`\`
GET /api/travel-agencies
\`\`\`

Query parameters:
\`\`\`
page: 1
limit: 10
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "results": 5,
  "total": 15,
  "page": 1,
  "limit": 10,
  "data": {
    "travel_agencies": [
      {
        "id": "uuid",
        "agency_name": "Global Travels",
        "description": "Your global travel partner",
        "logo": "https://cloudinary.com/logo2.jpg",
        "rating": 4.8,
        "created_at": "2023-01-01T00:00:00.000Z",
        "updated_at": "2023-01-01T00:00:00.000Z"
      },
      // More travel agencies...
    ]
  }
}
\`\`\`

#### Get Travel Agency by ID

\`\`\`
GET /api/travel-agencies/:id
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "data": {
    "travel_agency": {
      "id": "uuid",
      "agency_name": "Global Travels",
      "description": "Your global travel partner",
      "license_number": "XYZ789012",
      "address": {
        "street": "456 Park Ave",
        "city": "New York",
        "state": "NY",
        "postal_code": "10002",
        "country": "USA"
      },
      "contact_email": "info@globaltravels.com",
      "contact_phone": "+1234567890",
      "website": "https://globaltravels.com",
      "logo": "https://cloudinary.com/logo2.jpg",
      "rating": 4.8,
      "travel_packages": [
        {
          "id": "uuid",
          "name": "European Tour",
          "description": "Explore the best of Europe",
          "price": 2000,
          "duration": 14
        },
        // More travel packages...
      ],
      "reviews": [
        {
          "id": "uuid",
          "user": {
            "id": "uuid",
            "first_name": "John",
            "last_name": "Doe",
            "profile_picture": "https://cloudinary.com/profile.jpg"
          },
          "rating": 5,
          "comment": "Excellent travel agency",
          "created_at": "2023-01-01T00:00:00.000Z"
        },
        // More reviews...
      ],
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  }
}
\`\`\`

#### Update Travel Agency

\`\`\`
PUT /api/travel-agencies/:id
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
\`\`\`

Request body:
\`\`\`json
{
  "agency_name": "Global Travels International",
  "description": "Your premium global travel partner",
  "website": "https://globaltravelsinternational.com"
}
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "Travel agency updated successfully",
  "data": {
    "travel_agency": {
      "id": "uuid",
      "agency_name": "Global Travels International",
      // Updated travel agency details...
    }
  }
}
\`\`\`

#### Delete Travel Agency

\`\`\`
DELETE /api/travel-agencies/:id
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "Travel agency deleted successfully"
}
\`\`\`

### Destinations

#### Get All Destinations

\`\`\`
GET /api/destinations
\`\`\`

Query parameters:
\`\`\`
continent: Europe
country: France
page: 1
limit: 10
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "results": 5,
  "total": 15,
  "page": 1,
  "limit": 10,
  "data": {
    "destinations": [
      {
        "id": "uuid",
        "name": "Paris",
        "description": "The City of Light",
        "country": "France",
        "continent": "Europe",
        "image": "https://cloudinary.com/paris.jpg",
        "created_at": "2023-01-01T00:00:00.000Z",
        "updated_at": "2023-01-01T00:00:00.000Z"
      },
      // More destinations...
    ]
  }
}
\`\`\`

#### Get Destination by ID

\`\`\`
GET /api/destinations/:id
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "data": {
    "destination": {
      "id": "uuid",
      "name": "Paris",
      "description": "The City of Light",
      "country": "France",
      "continent": "Europe",
      "image": "https://cloudinary.com/paris.jpg",
      "attractions": ["Eiffel Tower", "Louvre Museum", "Notre-Dame Cathedral"],
      "best_time_to_visit": "April to June, September to October",
      "travel_tips": ["Learn basic French phrases", "Use the Metro for transportation"],
      "hotels": [
        {
          "id": "uuid",
          "name": "Grand Hotel Paris",
          "rating": 4.5,
          "price_per_night": 200
        },
        // More hotels...
      ],
      "trips": [
        {
          "id": "uuid",
          "title": "Paris Explorer",
          "duration": 5,
          "price": 1000
        },
        // More trips...
      ],
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  }
}
\`\`\`

#### Create Destination (Admin)

\`\`\`
POST /api/destinations
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
Content-Type: multipart/form-data
\`\`\`

Request body:
\`\`\`
name: Paris
description: The City of Light
country: France
continent: Europe
attractions: Eiffel Tower,Louvre Museum,Notre-Dame Cathedral
best_time_to_visit: April to June, September to October
travel_tips: Learn basic French phrases,Use the Metro for transportation
image: [file]
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "Destination created successfully",
  "data": {
    "destination": {
      "id": "uuid",
      "name": "Paris",
      // Other destination details...
    }
  }
}
\`\`\`

#### Update Destination (Admin)

\`\`\`
PUT /api/destinations/:id
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
\`\`\`

Request body:
\`\`\`json
{
  "description": "The romantic City of Light",
  "attractions": ["Eiffel Tower", "Louvre Museum", "Notre-Dame Cathedral", "Champs-Élysées"]
}
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "Destination updated successfully",
  "data": {
    "destination": {
      "id": "uuid",
      "name": "Paris",
      // Updated destination details...
    }
  }
}
\`\`\`

#### Delete Destination (Admin)

\`\`\`
DELETE /api/destinations/:id
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "Destination deleted successfully"
}
\`\`\`

### Admin

#### Get All Users (Admin)

\`\`\`
GET /api/admin/users
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
\`\`\`

Query parameters:
\`\`\`
role: user
status: active
page: 1
limit: 10
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "results": 10,
  "total": 100,
  "page": 1,
  "limit": 10,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "john@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "role": "user",
        "status": "active",
        "created_at": "2023-01-01T00:00:00.000Z",
        "updated_at": "2023-01-01T00:00:00.000Z"
      },
      // More users...
    ]
  }
}
\`\`\`

#### Update User (Admin)

\`\`\`
PUT /api/admin/users/:id
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
\`\`\`

Request body:
\`\`\`json
{
  "role": "service_provider",
  "status": "active"
}
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "User updated successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "john@example.com",
      // Updated user details...
    }
  }
}
\`\`\`

#### Delete User (Admin)

\`\`\`
DELETE /api/admin/users/:id
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "message": "User deleted successfully"
}
\`\`\`

#### Get Admin Dashboard Stats

\`\`\`
GET /api/admin/dashboard
\`\`\`

Headers:
\`\`\`
Authorization: Bearer jwt_access_token
\`\`\`

Response:
\`\`\`json
{
  "status": "success",
  "data": {
    "stats": {
      "users": {
        "total": 1000,
        "new_this_month": 50
      },
      "bookings": {
        "total": 500,
        "pending": 20,
        "confirmed": 450,
        "cancelled": 30
      },
      "revenue": {
        "total": 50000,
        "this_month": 5000,
        "last_month": 4500
      },
      "popular_destinations": [
        {
          "id": "uuid",
          "name": "Paris",
          "bookings_count": 100
        },
        // More destinations...
      ],
      "recent_bookings": [
        {
          "id": "uuid",
          "user": {
            "id": "uuid",
            "first_name": "John",
            "last_name": "Doe"
          },
          "booking_type": "hotel",
          "hotel": {
            "id": "uuid",
            "name": "Grand Hotel"
          },
          "total_price": 800,
          "created_at": "2023-01-01T00:00:00.000Z"
        },
        // More recent bookings...
      ]
    }
  }
}
\`\`\`

## Core Utilities

### Error Handling

The application uses a centralized error handling system with custom error classes and middleware.

#### AppError Class

Located at `src/utils/appError.ts`, this class extends the native Error class to provide additional properties for API errors:

\`\`\`typescript
class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}
\`\`\`

#### Error Handler Middleware

Located at `src/middleware/errorHandler.ts`, this middleware handles all errors in the application:

\`\`\`typescript
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  // Development error response
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }
  
  // Production error response
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }
  
  // Programming or unknown errors
  console.error('ERROR 💥', err);
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong'
  });
};
\`\`\`

#### CatchAsync Utility

Located at `src/utils/catchAsync.ts`, this utility wraps async controller functions to catch errors and pass them to the error handler:

\`\`\`typescript
const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
\`\`\`

### Authentication Utilities

#### Token Utilities

Located at `src/utils/tokens.ts`, these utilities handle JWT token generation and verification:

\`\`\`typescript
// Generate access token
const generateAccessToken = (userId: string): string => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Generate refresh token
const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN
  });
};

// Verify token
const verifyToken = (token: string, secret: string): any => {
  return jwt.verify(token, secret);
};
\`\`\`

### File Upload

Located at `src/utils/fileUpload.ts`, this utility handles file uploads to Cloudinary:

\`\`\`typescript
// Upload file to Cloudinary
const uploadFile = async (file: Express.Multer.File, folder: string): Promise<CloudinaryResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result as CloudinaryResult);
      }
    );
    
    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};

// Delete file from Cloudinary
const deleteFile = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};
\`\`\`

### Email Service

Located at `src/utils/email.ts`, this utility handles email sending with Resend:

\`\`\`typescript
// Send email
const sendEmail = async (options: EmailOptions): Promise<void> => {
  const { to, subject, template, data } = options;
  
  // Read email template
  const templatePath = path.join(__dirname, `../../public/emails/${template}.html`);
  let html = await fs.readFile(templatePath, 'utf-8');
  
  // Replace placeholders with data
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, value);
  });
  
  // Send email with Resend
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to,
    subject,
    html
  });
};
\`\`\`

### SMS Service

Located at `src/utils/sms.ts`, this utility handles SMS sending with Twilio:

\`\`\`typescript
// Send SMS
const sendSMS = async (options: SMSOptions): Promise<void> => {
  const { to, message } = options;
  
  await twilioClient.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER!,
    to
  });
};
\`\`\`

### Validation

The application uses Zod for request validation. Validation schemas are located in the `src/validators` directory:

\`\`\`typescript
// User validation schema
const createUserSchema = z.object({
  full_name: z.string().min(3).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  confirm_password: z.string().min(8),
  phone_number: z.string().optional()
}).refine(data => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"]
});
\`\`\`

### Logging

Located at `src/utils/logger.ts`, this utility handles application logging with Winston:

\`\`\`typescript
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
\`\`\`

## Middleware

### Authentication Middleware

Located at `src/middleware/authMiddleware.ts`, these middleware functions handle authentication and authorization:

\`\`\`typescript
// Protect routes
const protect = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Get token from header or cookie
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt && process.env.USE_COOKIE_AUTH === 'true') {
    token = req.cookies.jwt;
  }
  
  if (!token) {
    return next(new AppError('You are not logged in. Please log in to get access.', 401));
  }
  
  // Verify token
  const decoded = verifyToken(token, process.env.JWT_SECRET!);
  
  // Check if user still exists
  const user = await prisma.user.findUnique({
    where: { id: decoded.id }
  });
  
  if (!user) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }
  
  // Grant access to protected route
  req.user = user;
  next();
});

// Restrict to specific roles
const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};
\`\`\`

### Validation Middleware

Located at `src/middleware/validateRequest.ts`, this middleware validates requests using Zod schemas:

\`\`\`typescript
const validateRequest = (schema: AnyZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          status: 'fail',
          message: 'Validation error',
          errors
        });
      }
      next(error);
    }
  };
};
\`\`\`

### Error Handling Middleware

Located at `src/middleware/errorHandler.ts`, this middleware handles all errors in the application (see Error Handling section).

### Role-Based Access Control

The application uses role-based access control to restrict access to certain routes. Roles include:

- `user`: Regular user
- `service_provider`: Service provider
- `travel_agency`: Travel agency
- `admin`: Administrator

## Testing

The application uses Jest for testing. Tests are located in the `tests` directory.

\`\`\`bash
# Run tests
bun test

# Run tests with coverage
bun test:coverage
\`\`\`

## Deployment

### Standard Deployment

1. **Clone the repository on your server**

   \`\`\`bash
   git clone https://github.com/yourusername/trippz-backend.git
   cd trippz-backend
   \`\`\`

2. **Install dependencies**

   \`\`\`bash
   bun install --production
   \`\`\`

3. **Set up environment variables**

   Create a `.env` file with your production configuration.

4. **Build the application**

   \`\`\`bash
   bun run build
   \`\`\`

5. **Set up the database**

   \`\`\`bash
   bun prisma generate
   bun prisma migrate deploy
   bun prisma db seed
   \`\`\`

6. **Start the application**

   \`\`\`bash
   bun start
   \`\`\`

   For production environments, it's recommended to use a process manager like PM2:

   \`\`\`bash
   # Install PM2
   npm install -g pm2

   # Start with PM2
   pm2 start dist/index.js --name trippz-backend
   \`\`\`

### Docker Deployment

A Dockerfile is included for containerized deployment:

\`\`\`bash
# Build the Docker image
docker build -t trippz-backend .

# Run the container
docker run -p 5000:5000 --env-file .env trippz-backend
\`\`\`

## Troubleshooting

### Database Connection Issues

- Ensure your PostgreSQL server is running
- Verify the DATABASE_URL in your .env file
- Check network connectivity to the database server

### Authentication Issues

- Verify JWT_SECRET and JWT_REFRESH_SECRET are set correctly
- Check that social auth credentials are valid
- Ensure FRONTEND_URL is set to the correct origin

### File Upload Issues

- Verify Cloudinary credentials
- Check file size limits in the code and Cloudinary settings
- Ensure proper CORS configuration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

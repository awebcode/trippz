# Trippz Backend API

A comprehensive backend API for the Trippz travel application built with Node.js, Express, TypeScript, and Prisma.

## Features

- User authentication and authorization
- Hotel, flight, and trip management
- Booking and reservation system
- Payment processing
- Review system
- File uploads with Cloudinary
- Email notifications with Resend
- SMS notifications with Twilio

## Tech Stack

- Node.js & Express
- TypeScript
- Prisma ORM with PostgreSQL
- JWT for authentication
- Zod for validation
- Winston for logging
- Multer for file uploads
- Cloudinary for file storage
- Resend for email
- Twilio for SMS

## Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL
- Cloudinary account
- Resend account
- Twilio account

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/trippz-backend.git
   cd trippz-backend
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Set up environment variables:
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   Then fill in the required environment variables in the `.env` file.

4. Generate Prisma client:
   \`\`\`bash
   npx prisma generate
   \`\`\`

5. Run database migrations:
   \`\`\`bash
   npx prisma migrate dev
   \`\`\`

6. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## API Documentation

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/verify-email` - Verify email
- `POST /api/auth/verify-phone` - Verify phone number

### User

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Update password
- `POST /api/users/profile-picture` - Upload profile picture
- `POST /api/users/addresses` - Add address
- `GET /api/users/addresses` - Get user addresses
- `DELETE /api/users/addresses/:id` - Delete address

### Hotels

- `GET /api/hotels` - Get all hotels
- `GET /api/hotels/search` - Search hotels
- `GET /api/hotels/:id` - Get hotel by ID
- `POST /api/hotels` - Create hotel (admin/service provider)
- `PUT /api/hotels/:id` - Update hotel (admin/service provider)
- `DELETE /api/hotels/:id` - Delete hotel (admin/service provider)

### Flights

- `GET /api/flights` - Get all flights
- `GET /api/flights/search` - Search flights
- `GET /api/flights/:id` - Get flight by ID
- `POST /api/flights` - Create flight (admin/service provider)
- `PUT /api/flights/:id` - Update flight (admin/service provider)
- `DELETE /api/flights/:id` - Delete flight (admin/service provider)

### Trips

- `GET /api/trips` - Get all trips
- `GET /api/trips/search` - Search trips
- `GET /api/trips/:id` - Get trip by ID
- `POST /api/trips` - Create trip
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip

### Bookings

- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/:id` - Get booking by ID
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Payments

- `POST /api/payments` - Process payment
- `GET /api/payments` - Get user payments
- `GET /api/payments/:id` - Get payment by ID
- `POST /api/payments/:id/refund` - Refund payment

### Reviews

- `POST /api/reviews` - Create review
- `GET /api/reviews/hotels/:id` - Get hotel reviews
- `GET /api/reviews/flights/:id` - Get flight reviews
- `GET /api/reviews/trips/:id` - Get trip reviews
- `GET /api/reviews/user` - Get user reviews
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

## License

This project is licensed under the MIT License.

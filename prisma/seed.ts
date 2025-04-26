import { prisma } from "../src/lib/prisma";
import { faker } from "@faker-js/faker";
import { logger } from "../src/utils/logger";

const LIMIT = 20;

/**
 * Seed database with fake data
 * @description Users (LIMIT records): Includes fields like id, first_name, email, role, etc.
RefreshToken (LIMIT records): Linked to users, with tokens and expiration dates.
EmailVerification (LIMIT records): Linked to users, with verification tokens.
PhoneVerification (LIMIT records): Linked to users, with verification codes.
PasswordReset (LIMIT records): Linked to users, with reset tokens.
SocialLogin (LIMIT records): Linked to users, with providers like Google or Facebook.
Profile (LIMIT records): Linked to users, with bio, theme, and address.
Hotels (LIMIT records): Includes name, address, rating, and amenities.
Flights (LIMIT records): Includes flight number, airline, and seat class.
Trips (LIMIT records): Linked to users, with trip name and type.
CancelationPolicy (LIMIT records): Defines refund policies.
Bookings (LIMIT records): Linked to users, hotels, flights, trips, and cancellation policies.
Payments (LIMIT records): Linked to bookings, with payment methods and status.
PaymentDetail (LIMIT records): Linked to payments, with transaction details.
Reservations (LIMIT records): Linked to users, with reservation types.
Favorites (LIMIT records): Linked to users, hotels, flights, or trips.
Images (LIMIT records): Linked to users, hotels, flights, or trips.
SearchHistory (LIMIT records): Linked to users, with search queries.
RecentSearch (LIMIT records): Linked to users, with search filters.
Notifications (LIMIT records): Linked to users, with various notification types.
NotificationPreference (LIMIT records): Linked to users, with notification settings.
PushToken (LIMIT records): Linked to users, with push notification tokens.
Filter (LIMIT records): Defines search filters like price range or amenities.
TrendingSearch (LIMIT records): Stores trending search queries.
UserRole (LIMIT records): Linked to users, with role assignments.
Reviews (LIMIT records): Linked to users, hotels, flights, or trips.
Discounts (LIMIT records): Defines discount codes and types.
Transactions (LIMIT records): Linked to users, with transaction types.
ExternalIntegration (LIMIT records): Linked to users, with API keys.
UserActivity (LIMIT records): Linked to users, with activity types.
Addresses (LIMIT records): Linked to users, with address details.
ServiceProviders (LIMIT records): Linked to users, with business details.
Services (LIMIT records): Linked to service providers, with service details.
ServiceOrders (LIMIT records): Linked to services and users.
TravelAgencies (LIMIT records): Linked to users, with agency details.
Destinations (LIMIT records): Includes city, country, and travel tips.
TravelPackages (LIMIT records): Linked to travel agencies and destinations.
PackageOrders (LIMIT records): Linked to travel packages and users.
SystemSetting (1 record): Stores global system settings like maintenance mode. 
 */
async function seed() {
  try {
    // Helper function to get random enum value
    const randomEnum = (enumObj): any => {
      const values = Object.values(enumObj);
      return values[Math.floor(Math.random() * values.length)];
    };

    // Helper function to generate random date within a range
    const randomDate = (start, end) => {
      return new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime())
      );
    };

    // Seed Users (LIMIT records)
    const users: any = [];
    logger.info("Seeding users...");
    for (let i = 0; i < LIMIT; i++) {
      const user = await prisma.user.create({
        data: {
          id: faker.string.uuid(),
          first_name: faker.person.firstName(),
          last_name: faker.person.lastName(),
          email: faker.internet.email(),
          phone_number: faker.phone.number(),
          password_hash: faker.internet.password(),
          role: randomEnum({
            USER: "USER",
            SERVICE_PROVIDER: "SERVICE_PROVIDER",
            ADMIN: "ADMIN",
            TRAVEL_AGENCY: "TRAVEL_AGENCY",
          }),
          created_at: faker.date.past(),
          updated_at: faker.date.recent(),
          email_verified: faker.datatype.boolean(),
          phone_verified: faker.datatype.boolean(),
          date_of_birth: faker.date.birthdate(),
          address: faker.location.streetAddress(),
          profile_picture: faker.image.avatar(),
        },
      });
      users.push(user);
    }

    // Seed RefreshToken (LIMIT records, linked to users)
    const refreshTokens: any = [];
    logger.info("Seeding refresh tokens...");
    for (let i = 0; i < LIMIT; i++) {
      const user = users[i];
      const token = await prisma.refreshToken.create({
        data: {
          id: faker.string.uuid(),
          userId: user.id,
          token: faker.string.alphanumeric(64),
          expiresAt: faker.date.future(),
          created_at: faker.date.past(),
        },
      });
      refreshTokens.push(token);
    }

    // Seed EmailVerification (LIMIT records, linked to users)
    const emailVerifications: any = [];
    logger.info("Seeding email verifications...");
    for (let i = 0; i < LIMIT; i++) {
      const user = users[i];
      const verification = await prisma.emailVerification.create({
        data: {
          id: faker.string.uuid(),
          userId: user.id,
          token: faker.string.alphanumeric(32),
          expiresAt: faker.date.future(),
          created_at: faker.date.past(),
        },
      });
      emailVerifications.push(verification);
    }

    // Seed PhoneVerification (LIMIT records, linked to users)
    const phoneVerifications: any = [];
    logger.info("Seeding phone verifications...");
    for (let i = 0; i < LIMIT; i++) {
      const user = users[i];
      const verification = await prisma.phoneVerification.create({
        data: {
          id: faker.string.uuid(),
          userId: user.id,
          code: faker.string.numeric(6),
          expiresAt: faker.date.future(),
          created_at: faker.date.past(),
        },
      });
      phoneVerifications.push(verification);
    }

    // Seed PasswordReset (LIMIT records, linked to users)
    const passwordResets: any = [];
    logger.info("Seeding password resets...");
    for (let i = 0; i < LIMIT; i++) {
      const user = users[i];
      const reset = await prisma.passwordReset.create({
        data: {
          id: faker.string.uuid(),
          userId: user.id,
          token: faker.string.alphanumeric(32),
          expiresAt: faker.date.future(),
          created_at: faker.date.past(),
        },
      });
      passwordResets.push(reset);
    }

    // Seed SocialLogin (LIMIT records, linked to users)
    const socialLogins: any = [];
    logger.info("Seeding social logins...");
    for (let i = 0; i < LIMIT; i++) {
      const user = users[i];
      const login = await prisma.socialLogin.create({
        data: {
          id: faker.string.uuid(),
          userId: user.id,
          provider: randomEnum({
            GOOGLE: "GOOGLE",
            FACEBOOK: "FACEBOOK",
            APPLE: "APPLE",
          }),
          providerId: faker.string.uuid(),
          created_at: faker.date.past(),
          updated_at: faker.date.recent(),
        },
      });
      socialLogins.push(login);
    }

    // Seed Profile (LIMIT records, linked to users)
    const profiles: any = [];
    logger.info("Seeding profiles...");
    for (let i = 0; i < LIMIT; i++) {
      const user = users[i];
      const profile = await prisma.profile.create({
        data: {
          id: faker.string.uuid(),
          user_id: user.id,
          bio: faker.lorem.paragraph(),
          theme: faker.helpers.arrayElement(["light", "dark"]),
          language: faker.helpers.arrayElement(["en", "es", "fr"]),
          profile_picture: faker.image.avatar(),
          address: faker.location.streetAddress(),
          updated_at: faker.date.recent(),
        },
      });
      profiles.push(profile);
    }

    // Seed Hotels (LIMIT records)
    const hotels: any = [];
    logger.info("Seeding hotels...");
    for (let i = 0; i < LIMIT; i++) {
      const hotel = await prisma.hotel.create({
        data: {
          id: faker.string.uuid(),
          name: faker.company.name() + " Hotel",
          address: faker.location.streetAddress(),
          rating: faker.number.float({ min: 1, max: 5 }),
          price_per_night: faker.number.float({ min: 50, max: 500 }),
          amenities: faker.helpers.arrayElements(
            ["WiFi", "Pool", "Gym", "Spa", "Restaurant"],
            { min: 2, max: 5 }
          ),
          available_rooms: faker.number.int({ min: 10, max: 100 }),
          created_at: faker.date.past(),
          updated_at: faker.date.recent(),
        },
      });
      hotels.push(hotel);
    }

    // Seed Flights (LIMIT records)
    const flights: any = [];
    logger.info("Seeding flights...");
    for (let i = 0; i < LIMIT; i++) {
      const flight = await prisma.flight.create({
        data: {
          id: faker.string.uuid(),
          flight_number: faker.string.alphanumeric(6),
          airline: faker.company.name() + " Airlines",
          departure_time: faker.date.soon(),
          arrival_time: faker.date.soon(),
          from_airport: faker.location.city(),
          to_airport: faker.location.city(),
          price: faker.number.float({ min: 100, max: 1000 }),
          seat_class: faker.helpers.arrayElement(["Economy", "Business", "First"]),
          created_at: faker.date.past(),
          updated_at: faker.date.recent(),
        },
      });
      flights.push(flight);
    }

    // Seed Trips (LIMIT records, linked to users)
    const trips: any = [];
    logger.info("Seeding trips...");
    for (let i = 0; i < LIMIT; i++) {
      const user = users[i];
      const trip = await prisma.trip.create({
        data: {
          id: faker.string.uuid(),
          user_id: user.id,
          trip_name: faker.lorem.words(3),
          description: faker.lorem.paragraph(),
          start_date: faker.date.soon(),
          end_date: faker.date.future(),
          trip_type: randomEnum({
            ADVENTURE: "ADVENTURE",
            MEDICAL: "MEDICAL",
            BUSINESS: "BUSINESS",
            LEISURE: "LEISURE",
          }),
          price: faker.number.float({ min: 0, max: 5000 }),
          created_at: faker.date.past(),
          updated_at: faker.date.recent(),
        },
      });
      trips.push(trip);
    }

    // Seed CancelationPolicy (LIMIT records)
    const cancelationPolicies: any = [];
    logger.info("Seeding cancelation policies...");
    for (let i = 0; i < LIMIT; i++) {
      const policy = await prisma.cancelationPolicy.create({
        data: {
          id: faker.string.uuid(),
          policy_type: randomEnum({
            FULL_REFUND: "FULL_REFUND",
            PARTIAL_REFUND: "PARTIAL_REFUND",
            NO_REFUND: "NO_REFUND",
          }),
          description: faker.lorem.sentence(),
          penalty: faker.number.float({ min: 0, max: 100 }),
          created_at: faker.date.past(),
        },
      });
      cancelationPolicies.push(policy);
    }

    // Seed Bookings (LIMIT records, linked to users, hotels, flights, trips, cancelation policies)
    const bookings: any = [];
    logger.info("Seeding bookings...");
    for (let i = 0; i < LIMIT; i++) {
      const user = users[i];
      const booking = await prisma.booking.create({
        data: {
          id: faker.string.uuid(),
          user_id: user.id,
          booking_type: randomEnum({ FLIGHT: "FLIGHT", HOTEL: "HOTEL", TRIP: "TRIP" }),
          start_date: faker.date.soon(),
          end_date: faker.date.future(),
          status: randomEnum({
            PENDING: "PENDING",
            CONFIRMED: "CONFIRMED",
            CANCELED: "CANCELED",
            COMPLETED: "COMPLETED",
          }),
          total_price: faker.number.float({ min: 100, max: 5000 }),
          guests: faker.number.int({ min: 1, max: 10 }),
          special_requests: faker.lorem.sentence(),
          flight_id: i % 2 === 0 ? flights[i % flights.length].id : null,
          hotel_id: i % 2 === 1 ? hotels[i % hotels.length].id : null,
          trip_id: i % 3 === 0 ? trips[i % trips.length].id : null,
          cancellation_id: cancelationPolicies[i % cancelationPolicies.length].id,
          created_at: faker.date.past(),
          updated_at: faker.date.recent(),
        },
      });
      bookings.push(booking);
    }

    // Seed Payments (LIMIT records, linked to bookings)
    const payments: any = [];
    logger.info("Seeding payments...");
    for (let i = 0; i < LIMIT; i++) {
      const booking = bookings[i];
      const payment = await prisma.payment.create({
        data: {
          id: faker.string.uuid(),
          booking_id: booking.id,
          payment_method: randomEnum({
            CREDIT_CARD: "CREDIT_CARD",
            PAYPAL: "PAYPAL",
            GOOGLE_PAY: "GOOGLE_PAY",
            APPLE_PAY: "APPLE_PAY",
          }),
          amount_paid: faker.number.float({ min: 50, max: 5000 }),
          payment_status: randomEnum({
            PENDING: "PENDING",
            SUCCESS: "SUCCESS",
            FAILED: "FAILED",
            REFUNDED: "REFUNDED",
          }),
          payment_date: faker.date.past(),
          created_at: faker.date.past(),
          updated_at: faker.date.recent(),
        },
      });
      payments.push(payment);
    }

    // Seed PaymentDetail (LIMIT records, linked to payments)
    const paymentDetails: any = [];
    logger.info("Seeding payment details...");
    for (let i = 0; i < LIMIT; i++) {
      const payment = payments[i];
      const detail = await prisma.paymentDetail.create({
        data: {
          id: faker.string.uuid(),
          paymentId: payment.id,
          transaction_id: faker.string.uuid(),
          provider: faker.company.name(),
          payment_data: JSON.stringify({ card: faker.finance.creditCardNumber() }),
          refund_id: faker.datatype.boolean() ? faker.string.uuid() : null,
          refund_data: faker.datatype.boolean()
            ? JSON.stringify({ reason: faker.lorem.sentence() })
            : null,
          created_at: faker.date.past(),
          updated_at: faker.date.recent(),
        },
      });
      paymentDetails.push(detail);
    }

    // Seed Reservations (LIMIT records, linked to users)
    const reservations: any = [];
    logger.info("Seeding reservations...");
    for (let i = 0; i < LIMIT; i++) {
      const user = users[i];
      const reservation = await prisma.reservation.create({
        data: {
          id: faker.string.uuid(),
          user_id: user.id,
          reservation_type: randomEnum({ FLIGHT: "FLIGHT", HOTEL: "HOTEL" }),
          status: randomEnum({
            PENDING: "PENDING",
            CANCELED: "CANCELED",
            MODIFIED: "MODIFIED",
          }),
          created_at: faker.date.past(),
          updated_at: faker.date.recent(),
        },
      });
      reservations.push(reservation);
    }

    // Seed Favorites (LIMIT records, linked to users, hotels, flights, trips)
    const favorites: any = [];
    logger.info("Seeding favorites...");
    for (let i = 0; i < LIMIT; i++) {
      const user = users[i];
      const favorite = await prisma.favorite.create({
        data: {
          id: faker.string.uuid(),
          user_id: user.id,
          hotel_id: i % 2 === 0 ? hotels[i % hotels.length].id : null,
          flight_id: i % 2 === 1 ? flights[i % flights.length].id : null,
          trip_id: i % 3 === 0 ? trips[i % trips.length].id : null,
          created_at: faker.date.past(),
        },
      });
      favorites.push(favorite);
    }

    // Seed Images (LIMIT records, linked to users, hotels, flights, trips)
    const images: any = [];
    logger.info("Seeding images...");
    for (let i = 0; i < LIMIT; i++) {
      const image = await prisma.image.create({
        data: {
          id: faker.string.uuid(),
          user_id: i % 2 === 0 ? users[i % users.length].id : null,
          hotel_id: i % 2 === 1 ? hotels[i % hotels.length].id : null,
          trip_id: i % 3 === 0 ? trips[i % trips.length].id : null,
          flightId: i % 4 === 0 ? flights[i % flights.length].id : null,
          file_url: faker.image.url(),
          file_type: "image/jpeg",
          created_at: faker.date.past(),
          updated_at: faker.date.recent(),
        },
      });
      images.push(image);
    }

    // Seed SearchHistory (LIMIT records, linked to users)
    const searchHistories: any = [];
    logger.info("Seeding search history...");
    for (let i = 0; i < LIMIT; i++) {
      const user = users[i];
      const history = await prisma.searchHistory.create({
        data: {
          id: faker.string.uuid(),
          user_id: user.id,
          search_query: faker.lorem.words(3),
          search_type: randomEnum({ FLIGHT: "FLIGHT", HOTEL: "HOTEL", TRIP: "TRIP" }),
          created_at: faker.date.past(),
        },
      });
      searchHistories.push(history);
    }

    // Seed RecentSearch (LIMIT records, linked to users)
    const recentSearches: any = [];
    logger.info("Seeding recent searches...");
    for (let i = 0; i < LIMIT; i++) {
      const user = users[i];
      const search = await prisma.recentSearch.create({
        data: {
          id: faker.string.uuid(),
          user_id: user.id,
          search_query: faker.lorem.words(3),
          search_type: randomEnum({ FLIGHT: "FLIGHT", HOTEL: "HOTEL", TRIP: "TRIP" }),
          filters: faker.helpers.arrayElements(["price", "location", "rating"], {
            min: 1,
            max: 3,
          }),
          created_at: faker.date.past(),
        },
      });
      recentSearches.push(search);
    }

    // Seed Notifications (LIMIT records, linked to users)
    const notifications: any = [];
    logger.info("Seeding notifications...");
    for (let i = 0; i < LIMIT; i++) {
      const user = users[i];
      const notification = await prisma.notification.create({
        data: {
          id: faker.string.uuid(),
          title: faker.lorem.words(3),
          message: faker.lorem.sentence(),
          user_id: user.id,
          notification_type: randomEnum({
            SYSTEM: "SYSTEM",
            BOOKING: "BOOKING",
            PAYMENT: "PAYMENT",
            PROMOTIONAL: "PROMOTIONAL",
            REMINDER: "REMINDER",
            ALERT: "ALERT",
            NEW_BOOKING: "NEW_BOOKING",
            TRIP_UPDATES: "TRIP_UPDATES",
            SPECIAL_OFFERS: "SPECIAL_OFFERS",
          }),
          entity_id: faker.string.uuid(),
          entity_type: faker.lorem.word(),
          metadata: { info: faker.lorem.sentence() },
          is_read: faker.datatype.boolean(),
          created_at: faker.date.past(),
        },
      });
      notifications.push(notification);
    }

    // Seed NotificationPreference (LIMIT records, linked to users)
    const notificationPreferences: any = [];
    logger.info("Seeding notification preferences...");
    for (let i = 0; i < LIMIT; i++) {
      const user = users[i];
      const preference = await prisma.notificationPreference.create({
        data: {
          id: faker.string.uuid(),
          user_id: user.id,
          email_enabled: faker.datatype.boolean(),
          sms_enabled: faker.datatype.boolean(),
          push_enabled: faker.datatype.boolean(),
          in_app_enabled: faker.datatype.boolean(),
          system_enabled: faker.datatype.boolean(),
          booking_enabled: faker.datatype.boolean(),
          payment_enabled: faker.datatype.boolean(),
          promotional_enabled: faker.datatype.boolean(),
          reminder_enabled: faker.datatype.boolean(),
          alert_enabled: faker.datatype.boolean(),
        },
      });
      notificationPreferences.push(preference);
    }

    // Seed PushToken (LIMIT records, linked to users)
    const pushTokens: any = [];
    logger.info("Seeding push tokens...");
    for (let i = 0; i < LIMIT; i++) {
      const user = users[i];
      const token = await prisma.pushToken.create({
        data: {
          id: faker.string.uuid(),
          user_id: user.id,
          token: faker.string.alphanumeric(64),
          created_at: faker.date.past(),
        },
      });
      pushTokens.push(token);
    }

    // Seed Filter (LIMIT records)
    const filters: any = [];
    logger.info("Seeding filters...");
    for (let i = 0; i < LIMIT; i++) {
      const filter = await prisma.filter.create({
        data: {
          id: faker.string.uuid(),
          filter_name: faker.lorem.word(),
          filter_type: randomEnum({
            PRICE_RANGE: "PRICE_RANGE",
            AMENITIES: "AMENITIES",
            LOCATION: "LOCATION",
            BEDROOMS: "BEDROOMS",
            BATHROOMS: "BATHROOMS",
            SEAT_CLASS: "SEAT_CLASS",
          }),
          values: faker.helpers.arrayElements(
            ["low", "medium", "high", "city", "suburb"],
            { min: 2, max: 5 }
          ),
          created_at: faker.date.past(),
        },
      });
      filters.push(filter);
    }

    // Seed TrendingSearch (LIMIT records)
    const trendingSearches: any = [];
    logger.info("Seeding trending searches...");
    for (let i = 0; i < LIMIT; i++) {
      const search = await prisma.trendingSearch.create({
        data: {
          id: faker.string.uuid(),
          search_query: faker.lorem.words(3),
          created_at: faker.date.past(),
        },
      });
      trendingSearches.push(search);
    }

    // Seed UserRole (LIMIT records, linked to users)
    const userRoles: any = [];
    logger.info("Seeding user roles...");
    for (let i = 0; i < LIMIT; i++) {
      const user = users[i];
      const role = await prisma.userRole.create({
        data: {
          id: faker.string.uuid(),
          user_id: user.id,
          role: randomEnum({
            USER: "USER",
            SERVICE_PROVIDER: "SERVICE_PROVIDER",
            ADMIN: "ADMIN",
            TRAVEL_AGENCY: "TRAVEL_AGENCY",
          }),
        },
      });
      userRoles.push(role);
    }

    // Seed Reviews (LIMIT records, linked to users, hotels, flights, trips)
    const reviews: any = [];
    logger.info("Seeding reviews...");
    for (let i = 0; i < LIMIT; i++) {
      const user = users[i];
      const review = await prisma.review.create({
        data: {
          id: faker.string.uuid(),
          user_id: user.id,
          hotel_id: i % 2 === 0 ? hotels[i % hotels.length].id : null,
          flight_id: i % 2 === 1 ? flights[i % flights.length].id : null,
          trip_id: i % 3 === 0 ? trips[i % trips.length].id : null,
          rating: faker.number.float({ min: 1, max: 5 }),
          comment: faker.lorem.paragraph(),
          created_at: faker.date.past(),
          updated_at: faker.date.recent(),
        },
      });
      reviews.push(review);
    }

    // Seed Discounts (LIMIT records)
    const discounts: any = [];
    logger.info("Seeding discounts...");
    for (let i = 0; i < LIMIT; i++) {
      const discount = await prisma.discount.create({
        data: {
          id: faker.string.uuid(),
          code: faker.string.alphanumeric(8),
          description: faker.lorem.sentence(),
          discount_type: randomEnum({ PERCENTAGE: "PERCENTAGE", FIXED: "FIXED" }),
          amount: faker.number.float({ min: 10, max: 100 }),
          start_date: faker.date.past(),
          end_date: faker.date.future(),
          created_at: faker.date.past(),
          updated_at: faker.date.recent(),
        },
      });
      discounts.push(discount);
    }

    // Seed Transactions (LIMIT records, linked to users)
    const transactions: any = [];
    logger.info("Seeding transactions...");
    for (let i = 0; i < LIMIT; i++) {
      const user = users[i];
      const transaction = await prisma.transaction.create({
        data: {
          id: faker.string.uuid(),
          user_id: user.id,
          transaction_type: randomEnum({ PAYMENT: "PAYMENT", REFUND: "REFUND" }),
          amount: faker.number.float({ min: 50, max: 5000 }),
          status: randomEnum({
            PENDING: "PENDING",
            SUCCESS: "SUCCESS",
            FAILED: "FAILED",
            REFUNDED: "REFUNDED",
          }),
          created_at: faker.date.past(),
        },
      });
      transactions.push(transaction);
    }

    // Seed ExternalIntegration (LIMIT records, linked to users)
    const externalIntegrations: any = [];
    logger.info("Seeding external integrations...");
    for (let i = 0; i < LIMIT; i++) {
      const user = users[i];
      const integration = await prisma.externalIntegration.create({
        data: {
          id: faker.string.uuid(),
          integration_name: faker.company.name(),
          api_key: faker.string.alphanumeric(32),
          user_id: user.id,
          created_at: faker.date.past(),
          updated_at: faker.date.recent(),
        },
      });
      externalIntegrations.push(integration);
    }

    // Seed UserActivity (LIMIT records, linked to users)
    const userActivities: any = [];
    logger.info("Seeding user activities...");
    for (let i = 0; i < LIMIT; i++) {
      const user = users[i];
      const activity = await prisma.userActivity.create({
        data: {
          id: faker.string.uuid(),
          user_id: user.id,
          activity_type: randomEnum({
            LOGIN: "LOGIN",
            BOOKING: "BOOKING",
            PAYMENT: "PAYMENT",
            SEARCH: "SEARCH",
            REVIEW: "REVIEW",
          }),
          activity_data: faker.lorem.sentence(),
          created_at: faker.date.past(),
        },
      });
      userActivities.push(activity);
    }

    // Seed Addresses (LIMIT records, linked to users)
    const addresses: any = [];
    logger.info("Seeding addresses...");
    for (let i = 0; i < LIMIT; i++) {
      const user = users[i];
      const address = await prisma.address.create({
        data: {
          id: faker.string.uuid(),
          user_id: user.id,
          address: faker.location.streetAddress(),
          city: faker.location.city(),
          country: faker.location.country(),
          postal_code: faker.location.zipCode(),
          created_at: faker.date.past(),
          updated_at: faker.date.recent(),
        },
      });
      addresses.push(address);
    }

    // Seed ServiceProviders (LIMIT records, linked to users)
    const serviceProviders: any = [];
    logger.info("Seeding service providers...");
    for (let i = 0; i < LIMIT; i++) {
      const user = users[i];
      const provider = await prisma.serviceProvider.create({
        data: {
          id: faker.string.uuid(),
          user_id: user.id,
          business_name: faker.company.name(),
          business_address: faker.location.streetAddress(),
          business_phone: faker.phone.number(),
          business_email: faker.internet.email(),
          website: faker.internet.url(),
          description: faker.lorem.paragraph(),
          verified: faker.datatype.boolean(),
          rating: faker.number.float({ min: 0, max: 5 }),
          created_at: faker.date.past(),
          updated_at: faker.date.recent(),
        },
      });
      serviceProviders.push(provider);
    }

    // Seed Services (LIMIT records, linked to service providers)
    const services: any = [];
    logger.info("Seeding services...");
    for (let i = 0; i < LIMIT; i++) {
      const provider = serviceProviders[i % serviceProviders.length];
      const service = await prisma.service.create({
        data: {
          id: faker.string.uuid(),
          provider_id: provider.id,
          name: faker.commerce.productName(),
          description: faker.lorem.paragraph(),
          price: faker.number.float({ min: LIMIT, max: 1000 }),
          duration: faker.number.int({ min: 30, max: 240 }),
          location: faker.location.city(),
          category: faker.commerce.department(),
          availability: {
            days: faker.helpers.arrayElements(
              ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              { min: 2, max: 5 }
            ),
          },
          max_participants: faker.number.int({ min: 1, max: 50 }),
          created_at: faker.date.past(),
          updated_at: faker.date.recent(),
        },
      });
      services.push(service);
    }

    // Seed ServiceOrders (LIMIT records, linked to services and users)
    const serviceOrders: any = [];
    logger.info("Seeding service orders...");
    for (let i = 0; i < LIMIT; i++) {
      const service = services[i % services.length];
      const user = users[i];
      const order = await prisma.serviceOrder.create({
        data: {
          id: faker.string.uuid(),
          service_id: service.id,
          user_id: user.id,
          status: randomEnum({
            PENDING: "PENDING",
            CONFIRMED: "CONFIRMED",
            REJECTED: "REJECTED",
            COMPLETED: "COMPLETED",
            CANCELLED: "CANCELLED",
          }),
          date: faker.date.soon(),
          participants: faker.number.int({ min: 1, max: 10 }),
          total_price: faker.number.float({ min: LIMIT, max: 1000 }),
          special_requests: faker.lorem.sentence(),
          provider_response: faker.lorem.sentence(),
          created_at: faker.date.past(),
          updated_at: faker.date.recent(),
        },
      });
      serviceOrders.push(order);
    }

    // Seed TravelAgencies (LIMIT records, linked to users)
    const travelAgencies: any = [];
    logger.info("Seeding travel agencies...");
    for (let i = 0; i < LIMIT; i++) {
      const user = users[i];
      const agency = await prisma.travelAgency.create({
        data: {
          id: faker.string.uuid(),
          user_id: user.id,
          agency_name: faker.company.name() + " Travel",
          agency_address: faker.location.streetAddress(),
          agency_phone: faker.phone.number(),
          agency_email: faker.internet.email(),
          website: faker.internet.url(),
          description: faker.lorem.paragraph(),
          verified: faker.datatype.boolean(),
          rating: faker.number.float({ min: 0, max: 5 }),
          created_at: faker.date.past(),
          updated_at: faker.date.recent(),
        },
      });
      travelAgencies.push(agency);
    }

    // Seed Destinations (LIMIT records)
    const destinations: any = [];
    logger.info("Seeding destinations...");
    for (let i = 0; i < LIMIT; i++) {
      const destination = await prisma.destination.create({
        data: {
          id: faker.string.uuid(),
          name: faker.location.city(),
          country: faker.location.country(),
          city: faker.location.city(),
          description: faker.lorem.paragraph(),
          highlights: faker.lorem.words(5).split(" "),
          best_time_to_visit: faker.lorem.word(),
          travel_tips: faker.lorem.sentences(3).split(". "),
          created_at: faker.date.past(),
          updated_at: faker.date.recent(),
        },
      });
      destinations.push(destination);
    }

    // Seed TravelPackages (LIMIT records, linked to travel agencies and destinations)
    const travelPackages: any = [];
    logger.info("Seeding travel packages...");
    for (let i = 0; i < LIMIT; i++) {
      const agency = travelAgencies[i % travelAgencies.length];
      const packageData = await prisma.travelPackage.create({
        data: {
          id: faker.string.uuid(),
          agency_id: agency.id,
          name: faker.lorem.words(3),
          description: faker.lorem.paragraph(),
          price: faker.number.float({ min: 500, max: 10000 }),
          duration: faker.number.int({ min: 3, max: 14 }),
          inclusions: faker.lorem.words(5).split(" "),
          exclusions: faker.lorem.words(3).split(" "),
          itinerary: { day1: faker.lorem.sentence(), day2: faker.lorem.sentence() },
          max_travelers: faker.number.int({ min: 5, max: 50 }),
          created_at: faker.date.past(),
          updated_at: faker.date.recent(),
          destinations: {
            connect: [{ id: destinations[i % destinations.length].id }],
          },
        },
      });
      travelPackages.push(packageData);
    }

    // Seed PackageOrders (LIMIT records, linked to travel packages and users)
    const packageOrders: any = [];
    logger.info("Seeding package orders...");
    for (let i = 0; i < LIMIT; i++) {
      const packageData = travelPackages[i % travelPackages.length];
      const user = users[i];
      const order = await prisma.packageOrder.create({
        data: {
          id: faker.string.uuid(),
          package_id: packageData.id,
          user_id: user.id,
          status: randomEnum({
            PENDING: "PENDING",
            CONFIRMED: "CONFIRMED",
            REJECTED: "REJECTED",
            COMPLETED: "COMPLETED",
            CANCELLED: "CANCELLED",
          }),
          start_date: faker.date.soon(),
          travelers: faker.number.int({ min: 1, max: 10 }),
          total_price: faker.number.float({ min: 500, max: 10000 }),
          special_requests: faker.lorem.sentence(),
          agency_response: faker.lorem.sentence(),
          created_at: faker.date.past(),
          updated_at: faker.date.recent(),
        },
      });
      packageOrders.push(order);
    }

    // Seed SystemSetting (1 record, as it's typically a singleton)
    logger.info("Seeding system settings...");
    await prisma.systemSetting.create({
      data: {
        id: faker.string.uuid(),
        maintenance_mode: faker.datatype.boolean(),
        booking_fee_percentage: faker.number.float({ min: 1, max: 10 }),
        default_currency: "USD",
        support_email: faker.internet.email(),
        support_phone: faker.phone.number(),
        terms_url: faker.internet.url(),
        privacy_url: faker.internet.url(),
        created_at: faker.date.past(),
        updated_at: faker.date.recent(),
      },
    });

    logger.info("Seeding completed successfully!");
  } catch (error) {
    logger.error("Error seeding database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();

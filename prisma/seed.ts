import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // Create admin user
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@trippz.com" },
    update: {},
    create: {
      email: "admin@trippz.com",
      first_name: "Admin",
      last_name: "User",
      phone_number: "1234567890",
      password_hash: adminPassword,
      role: "ADMIN",
      email_verified: true,
      phone_verified: true,
      Profile: {
        create: {
          bio: "System administrator",
          theme: "dark",
          language: "en",
        },
      },
    },
  });
  console.log("Admin user created:", admin.id);

  // Create service provider user
  const providerPassword = await bcrypt.hash("Provider@123", 10);
  const provider = await prisma.user.upsert({
    where: { email: "provider@trippz.com" },
    update: {},
    create: {
      email: "provider@trippz.com",
      first_name: "Service",
      last_name: "Provider",
      phone_number: "0987654321",
      password_hash: providerPassword,
      role: "SERVICE_PROVIDER",
      email_verified: true,
      phone_verified: true,
      Profile: {
        create: {
          bio: "Travel service provider",
          theme: "light",
          language: "en",
        },
      },
    },
  });
  console.log("Service provider created:", provider.id);

  // Create regular user
  const userPassword = await bcrypt.hash("User@123", 10);
  const user = await prisma.user.upsert({
    where: { email: "user@trippz.com" },
    update: {},
    create: {
      email: "user@trippz.com",
      first_name: "Regular",
      last_name: "User",
      phone_number: "5555555555",
      password_hash: userPassword,
      role: "USER",
      email_verified: true,
      phone_verified: true,
      Profile: {
        create: {
          bio: "Travel enthusiast",
          theme: "light",
          language: "en",
        },
      },
    },
  });
  console.log("Regular user created:", user.id);

  // Create travel agency user
  const agencyPassword = await bcrypt.hash("Agency@123", 10);
  const agencyUser = await prisma.user.upsert({
    where: { email: "agency@trippz.com" },
    update: {},
    create: {
      email: "agency@trippz.com",
      first_name: "Travel",
      last_name: "Agency",
      phone_number: "7777777777",
      password_hash: agencyPassword,
      role: "SERVICE_PROVIDER",
      email_verified: true,
      phone_verified: true,
      Profile: {
        create: {
          bio: "Professional travel agency",
          theme: "light",
          language: "en",
        },
      },
    },
  });
  console.log("Travel agency user created:", agencyUser.id);

  // Create cancellation policies
  const fullRefund = await prisma.cancelationPolicy.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      policy_type: "FULL_REFUND",
      description: "Full refund if cancelled 7 days before the booking date",
      penalty: 0,
    },
  });

  const partialRefund = await prisma.cancelationPolicy.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      policy_type: "PARTIAL_REFUND",
      description: "50% refund if cancelled 3-7 days before the booking date",
      penalty: 50,
    },
  });

  const noRefund = await prisma.cancelationPolicy.upsert({
    where: { id: "00000000-0000-0000-0000-000000000003" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000003",
      policy_type: "NO_REFUND",
      description: "No refund if cancelled less than 3 days before the booking date",
      penalty: 100,
    },
  });
  console.log("Cancellation policies created");

  // Create hotels
  const hotel1 = await prisma.hotel.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Luxury Resort & Spa",
      address: "123 Beach Road, Miami, FL",
      rating: 4.8,
      price_per_night: 299.99,
      amenities: ["Pool", "Spa", "Gym", "Restaurant", "Bar", "WiFi", "Parking"],
      available_rooms: 50,
    },
  });

  const hotel2 = await prisma.hotel.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      name: "City Center Hotel",
      address: "456 Main Street, New York, NY",
      rating: 4.5,
      price_per_night: 199.99,
      amenities: ["Gym", "Restaurant", "Bar", "WiFi", "Business Center"],
      available_rooms: 100,
    },
  });

  const hotel3 = await prisma.hotel.upsert({
    where: { id: "00000000-0000-0000-0000-000000000003" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000003",
      name: "Mountain View Lodge",
      address: "789 Pine Road, Aspen, CO",
      rating: 4.7,
      price_per_night: 249.99,
      amenities: ["Fireplace", "Ski Storage", "Hot Tub", "Restaurant", "Bar", "WiFi"],
      available_rooms: 30,
    },
  });
  console.log("Hotels created");

  // Create flights
  const flight1 = await prisma.flight.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      flight_number: "AA123",
      airline: "American Airlines",
      departure_time: new Date("2023-12-15T08:00:00Z"),
      arrival_time: new Date("2023-12-15T11:00:00Z"),
      from_airport: "JFK",
      to_airport: "LAX",
      price: 349.99,
      seat_class: "Economy",
    },
  });

  const flight2 = await prisma.flight.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      flight_number: "DL456",
      airline: "Delta Airlines",
      departure_time: new Date("2023-12-20T10:00:00Z"),
      arrival_time: new Date("2023-12-20T14:00:00Z"),
      from_airport: "LAX",
      to_airport: "MIA",
      price: 399.99,
      seat_class: "Business",
    },
  });

  const flight3 = await prisma.flight.upsert({
    where: { id: "00000000-0000-0000-0000-000000000003" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000003",
      flight_number: "UA789",
      airline: "United Airlines",
      departure_time: new Date("2023-12-25T12:00:00Z"),
      arrival_time: new Date("2023-12-25T15:00:00Z"),
      from_airport: "ORD",
      to_airport: "DFW",
      price: 299.99,
      seat_class: "Economy",
    },
  });
  console.log("Flights created");

  // Create trips
  const trip1 = await prisma.trip.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      user_id: provider.id,
      trip_name: "Beach Getaway",
      description: "Enjoy a relaxing week at the beach with all amenities included.",
      start_date: new Date("2024-01-15"),
      end_date: new Date("2024-01-22"),
      trip_type: "LEISURE",
      price: 1299.99,
    },
  });

  const trip2 = await prisma.trip.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      user_id: provider.id,
      trip_name: "Mountain Adventure",
      description: "Experience the thrill of mountain climbing and hiking.",
      start_date: new Date("2024-02-10"),
      end_date: new Date("2024-02-17"),
      trip_type: "ADVENTURE",
      price: 1499.99,
    },
  });

  const trip3 = await prisma.trip.upsert({
    where: { id: "00000000-0000-0000-0000-000000000003" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000003",
      user_id: provider.id,
      trip_name: "Business Conference",
      description:
        "All-inclusive business conference package with accommodation and meals.",
      start_date: new Date("2024-03-05"),
      end_date: new Date("2024-03-08"),
      trip_type: "BUSINESS",
      price: 999.99,
    },
  });
  console.log("Trips created");

  // Create service provider
  const serviceProvider = await prisma.serviceProvider.upsert({
    where: { user_id: provider.id },
    update: {},
    create: {
      user_id: provider.id,
      business_name: "Adventure Travel Services",
      business_address: "123 Provider St, New York, NY",
      business_phone: "555-123-4567",
      business_email: "info@adventuretravel.com",
      website: "https://adventuretravel.com",
      description: "Providing premium travel services for adventure seekers",
      verified: true,
      rating: 4.8,
    },
  });
  console.log("Service provider created:", serviceProvider.id);

  // Create travel agency
  const travelAgency = await prisma.travelAgency.upsert({
    where: { user_id: agencyUser.id },
    update: {},
    create: {
      user_id: agencyUser.id,
      agency_name: "Global Journeys",
      agency_address: "456 Agency Blvd, Miami, FL",
      agency_phone: "555-987-6543",
      agency_email: "info@globaljourneys.com",
      website: "https://globaljourneys.com",
      description: "Your gateway to worldwide adventures",
      verified: true,
      rating: 4.7,
    },
  });
  console.log("Travel agency created:", travelAgency.id);

  // Create destinations
  const destination1 = await prisma.destination.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      name: "Bali",
      country: "Indonesia",
      city: "Denpasar",
      description: "Tropical paradise with beautiful beaches and rich culture",
      highlights: ["Beaches", "Temples", "Rice terraces", "Waterfalls"],
      best_time_to_visit: "April to October",
      travel_tips: ["Bring sunscreen", "Respect local customs", "Try local cuisine"],
    },
  });

  const destination2 = await prisma.destination.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      name: "Paris",
      country: "France",
      city: "Paris",
      description: "City of lights and romance",
      highlights: ["Eiffel Tower", "Louvre Museum", "Notre Dame", "Seine River"],
      best_time_to_visit: "April to June or September to October",
      travel_tips: [
        "Learn basic French phrases",
        "Use public transportation",
        "Visit museums on weekdays",
      ],
    },
  });
  console.log("Destinations created");

  // Create services
  const service1 = await prisma.service.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      provider_id: serviceProvider.id,
      name: "Guided Mountain Hiking",
      description: "Professional guided hiking tours in the most beautiful mountains",
      price: 149.99,
      duration: 480, // 8 hours
      location: "Rocky Mountains",
      category: "Adventure",
      max_participants: 10,
      availability: JSON.parse(
        '{"weekdays": ["Monday", "Wednesday", "Friday"], "hours": ["08:00", "09:00"]}'
      ),
    },
  });

  const service2 = await prisma.service.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      provider_id: serviceProvider.id,
      name: "Scuba Diving Lessons",
      description: "Learn to scuba dive with certified instructors",
      price: 299.99,
      duration: 360, // 6 hours
      location: "Miami Beach",
      category: "Water Sports",
      max_participants: 5,
      availability: JSON.parse(
        '{"weekdays": ["Tuesday", "Thursday", "Saturday"], "hours": ["10:00", "14:00"]}'
      ),
    },
  });
  console.log("Services created");

  // Create travel packages
  const travelPackage1 = await prisma.travelPackage.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      agency_id: travelAgency.id,
      name: "Bali Paradise Getaway",
      description: "Experience the beauty and culture of Bali",
      price: 1999.99,
      duration: 7, // 7 days
      inclusions: ["Accommodation", "Breakfast", "Airport transfers", "Guided tours"],
      exclusions: ["Flights", "Travel insurance", "Personal expenses"],
      itinerary: JSON.parse(
        '{"day1": "Arrival and welcome dinner", "day2": "Beach day", "day3": "Temple tour", "day4": "Rice terraces visit", "day5": "Waterfall trek", "day6": "Free day", "day7": "Departure"}'
      ),
      max_travelers: 20,
      destinations: {
        connect: [{ id: destination1.id }],
      },
    },
  });

  const travelPackage2 = await prisma.travelPackage.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      agency_id: travelAgency.id,
      name: "Romantic Paris Escape",
      description: "Discover the romance of Paris",
      price: 2499.99,
      duration: 5, // 5 days
      inclusions: [
        "Luxury accommodation",
        "Breakfast",
        "Seine River cruise",
        "Skip-the-line museum passes",
      ],
      exclusions: ["Flights", "Travel insurance", "Personal expenses"],
      itinerary: JSON.parse(
        '{"day1": "Arrival and Eiffel Tower visit", "day2": "Louvre Museum", "day3": "Montmartre and Sacré-Cœur", "day4": "Versailles day trip", "day5": "Shopping and departure"}'
      ),
      max_travelers: 2,
      destinations: {
        connect: [{ id: destination2.id }],
      },
    },
  });
  console.log("Travel packages created");

  // Create bookings
  const booking1 = await prisma.booking.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      user_id: user.id,
      booking_type: "HOTEL",
      hotel_id: hotel1.id,
      start_date: new Date("2023-12-20"),
      end_date: new Date("2023-12-27"),
      status: "CONFIRMED",
      total_price: 2099.93, // 7 nights
      cancellation_id: fullRefund.id,
    },
  });

  const booking2 = await prisma.booking.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000002",
      user_id: user.id,
      booking_type: "FLIGHT",
      flight_id: flight1.id,
      start_date: new Date("2023-12-15"),
      end_date: new Date("2023-12-15"),
      status: "CONFIRMED",
      total_price: 349.99,
      cancellation_id: partialRefund.id,
    },
  });

  const booking3 = await prisma.booking.upsert({
    where: { id: "00000000-0000-0000-0000-000000000003" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000003",
      user_id: user.id,
      booking_type: "TRIP",
      trip_id: trip1.id,
      start_date: new Date("2024-01-15"),
      end_date: new Date("2024-01-22"),
      status: "PENDING",
      total_price: 1299.99,
      cancellation_id: noRefund.id,
    },
  });
  console.log("Bookings created");

  // Create payments
  const payment1 = await prisma.payment.create({
    data: {
      booking_id: booking1.id,
      payment_method: "CREDIT_CARD",
      amount_paid: 2099.93,
      payment_status: "SUCCESS",
      payment_details: {
        create: {
          transaction_id: "txn_" + Math.random().toString(36).substring(2, 15),
          provider: "Stripe",
          payment_data: JSON.stringify({
            card_last4: "4242",
            card_brand: "Visa",
            card_exp_month: 12,
            card_exp_year: 2025,
          }),
        },
      },
    },
  });

  const payment2 = await prisma.payment.create({
    data: {
      booking_id: booking2.id,
      payment_method: "PAYPAL",
      amount_paid: 349.99,
      payment_status: "SUCCESS",
      payment_details: {
        create: {
          transaction_id: "txn_" + Math.random().toString(36).substring(2, 15),
          provider: "PayPal",
          payment_data: JSON.stringify({
            payer_email: "user@example.com",
            payer_id: "PAYERID123",
          }),
        },
      },
    },
  });
  console.log("Payments created");

  // Create service orders
  const serviceOrder = await prisma.serviceOrder.create({
    data: {
      service_id: service1.id,
      user_id: user.id,
      status: "CONFIRMED",
      date: new Date("2024-02-15T08:00:00Z"),
      participants: 2,
      total_price: 299.98,
      special_requests: "We would like to bring our camera equipment",
    },
  });
  console.log("Service order created:", serviceOrder.id);

  // Create package orders
  const packageOrder = await prisma.packageOrder.create({
    data: {
      package_id: travelPackage1.id,
      user_id: user.id,
      status: "CONFIRMED",
      start_date: new Date("2024-03-10"),
      travelers: 2,
      total_price: 3999.98,
      special_requests: "We're celebrating our anniversary",
    },
  });
  console.log("Package order created:", packageOrder.id);

  // Create reviews
  const review1 = await prisma.review.create({
    data: {
      user_id: user.id,
      hotel_id: hotel1.id,
      rating: 4.5,
      comment: "Beautiful resort with excellent service. The spa was amazing!",
    },
  });

  const review2 = await prisma.review.create({
    data: {
      user_id: user.id,
      flight_id: flight1.id,
      rating: 4.0,
      comment: "On-time departure and comfortable seats. Food could be better.",
    },
  });
  console.log("Reviews created");

  // Create discounts
  const discount1 = await prisma.discount.upsert({
    where: { code: "SUMMER2023" },
    update: {},
    create: {
      code: "SUMMER2023",
      description: "Summer special discount",
      discount_type: "PERCENTAGE",
      amount: 15,
      start_date: new Date("2023-06-01"),
      end_date: new Date("2023-08-31"),
    },
  });

  const discount2 = await prisma.discount.upsert({
    where: { code: "WELCOME50" },
    update: {},
    create: {
      code: "WELCOME50",
      description: "New user discount",
      discount_type: "FIXED",
      amount: 50,
      start_date: new Date("2023-01-01"),
      end_date: new Date("2023-12-31"),
    },
  });
  console.log("Discounts created");

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

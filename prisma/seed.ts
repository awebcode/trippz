import bcrypt from "bcrypt";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Starting seed...");

  // Create admin user
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@trippz.com" },
    update: {},
    create: {
      email: "admin@trippz.com",
      full_name: "Admin",
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
      full_name: "Service",
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
      full_name: "Regular",
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

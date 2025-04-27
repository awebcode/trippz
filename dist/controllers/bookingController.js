"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingController = void 0;
const bookingService_1 = require("../services/bookingService");
const catchAsync_1 = require("../utils/catchAsync");
const commonValidators_1 = require("../validators/commonValidators");
class BookingController {
}
exports.BookingController = BookingController;
_a = BookingController;
BookingController.createBooking = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.currentUser.id;
    const booking = await bookingService_1.BookingService.createBooking(userId, req.body);
    res.status(201).json({
        status: "success",
        data: {
            booking,
        },
    });
});
BookingController.getBookings = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.currentUser.id;
    const params = req.validatedQuery;
    const result = await bookingService_1.BookingService.getBookings(userId, params);
    res.status(200).json({
        status: "success",
        data: result.data,
        metadata: result.metadata,
    });
});
BookingController.getBookingById = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.currentUser.id;
    const { id } = commonValidators_1.idParamSchema.parse(req.params);
    const booking = await bookingService_1.BookingService.getBookingById(userId, id);
    res.status(200).json({
        status: "success",
        data: {
            booking,
        },
    });
});
BookingController.updateBooking = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.currentUser.id;
    const { id } = commonValidators_1.idParamSchema.parse(req.params);
    const booking = await bookingService_1.BookingService.updateBooking(userId, id, req.body);
    res.status(200).json({
        status: "success",
        data: {
            booking,
        },
    });
});
BookingController.cancelBooking = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const userId = req.currentUser.id;
    const { id } = commonValidators_1.idParamSchema.parse(req.params);
    const result = await bookingService_1.BookingService.cancelBooking(userId, id);
    res.status(200).json({
        status: "success",
        message: result.message,
        data: {
            booking: result.booking,
        },
    });
});
//# sourceMappingURL=bookingController.js.map
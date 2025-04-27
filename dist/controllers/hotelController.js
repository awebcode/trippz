"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelController = void 0;
const hotelService_1 = require("../services/hotelService");
const catchAsync_1 = require("../utils/catchAsync");
const appError_1 = require("../utils/appError");
class HotelController {
}
exports.HotelController = HotelController;
_a = HotelController;
HotelController.getAllHotels = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const hotels = await hotelService_1.HotelService.getHotels(req.validatedQuery);
    res.status(200).json({
        success: true,
        data: hotels.data,
        metadata: hotels.metadata,
    });
});
HotelController.getHotelById = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const hotelId = req.params.id;
    const hotel = await hotelService_1.HotelService.getHotelById(hotelId);
    if (!hotel) {
        return next(new appError_1.AppError("Hotel not found", 404));
    }
    res.status(200).json({
        success: true,
        data: hotel,
    });
});
HotelController.createHotel = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const hotelData = req.body;
    const hotel = await hotelService_1.HotelService.createHotel(hotelData);
    res.status(201).json({
        success: true,
        message: "Hotel created successfully",
        data: hotel,
    });
});
HotelController.updateHotel = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const hotelId = req.params.id;
    const hotelData = req.body;
    const hotel = await hotelService_1.HotelService.updateHotel(hotelId, hotelData);
    res.status(200).json({
        success: true,
        message: "Hotel updated successfully",
        data: hotel,
    });
});
HotelController.deleteHotel = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const hotelId = req.params.id;
    await hotelService_1.HotelService.deleteHotel(hotelId);
    res.status(200).json({
        success: true,
        message: "Hotel deleted successfully",
    });
});
HotelController.searchHotels = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const hotels = await hotelService_1.HotelService.searchHotels(req.validatedQuery);
    res.status(200).json({
        success: true,
        data: hotels.data,
        metadata: hotels.metadata,
    });
});
HotelController.getHotelAvailability = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const availability = await hotelService_1.HotelService.getHotelAvailability(req.validatedQuery);
    res.status(200).json({
        success: true,
        data: availability,
    });
});
//# sourceMappingURL=hotelController.js.map
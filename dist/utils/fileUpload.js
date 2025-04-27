"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processUploadedFiles = exports.createEntityImageUpload = exports.getFileInfo = exports.deleteMultipleFromCloudinary = exports.deleteFromCloudinary = exports.deleteLocalFile = exports.uploadMultipleToCloudinary = exports.uploadToCloudinary = exports.uploadFields = exports.uploadMultipleFiles = exports.uploadSingleFile = exports.uploadCloudinary = exports.uploadLocal = void 0;
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const appError_1 = require("./appError");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = require("./logger");
const config_1 = require("../config");
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: config_1.config.cloudinary.cloudName,
    api_key: config_1.config.cloudinary.apiKey,
    api_secret: config_1.config.cloudinary.apiSecret,
    secure: true
});
// Configure local storage for temporary files
const localStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, "../../uploads");
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});
// Configure Cloudinary storage
const cloudinaryStorage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: {
        folder: "trippz",
        allowed_formats: ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx"],
        transformation: [{ width: 1000, height: 1000, crop: "limit" }],
    },
});
// File filter function
const fileFilter = (req, file, cb) => {
    // Define allowed MIME types
    const allowedImageTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
    const allowedDocumentTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    // Check if the file type is allowed
    if ([...allowedImageTypes, ...allowedDocumentTypes].includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new appError_1.AppError("Unsupported file format. Only JPEG, PNG, GIF, PDF, DOC, and DOCX are allowed.", 400));
    }
};
// Create multer instances
exports.uploadLocal = (0, multer_1.default)({
    storage: localStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter,
});
exports.uploadCloudinary = (0, multer_1.default)({
    storage: cloudinaryStorage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter,
});
// Single file upload
exports.uploadSingleFile = exports.uploadCloudinary.single("file");
// Multiple files upload (max 10)
exports.uploadMultipleFiles = exports.uploadCloudinary.array("files", 10);
// Upload specific fields
const uploadFields = (fields) => {
    return exports.uploadCloudinary.fields(fields);
};
exports.uploadFields = uploadFields;
// Upload file to Cloudinary directly
const uploadToCloudinary = async (filePath, folder = "trippz") => {
    try {
        const result = await cloudinary_1.v2.uploader.upload(filePath, {
            folder,
            resource_type: "auto",
        });
        // Delete the local file after upload
        fs_1.default.unlink(filePath, (err) => {
            if (err)
                logger_1.logger.error(`Error deleting local file: ${err.message}`);
        });
        return {
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height,
        };
    }
    catch (error) {
        logger_1.logger.error(`Error uploading to Cloudinary: ${error.message}`);
        throw new appError_1.AppError(`Error uploading file to Cloudinary: ${error.message}`, 500);
    }
};
exports.uploadToCloudinary = uploadToCloudinary;
// Upload multiple files to Cloudinary
const uploadMultipleToCloudinary = async (filePaths, folder = "trippz") => {
    try {
        const uploadPromises = filePaths.map((filePath) => (0, exports.uploadToCloudinary)(filePath, folder));
        return await Promise.all(uploadPromises);
    }
    catch (error) {
        logger_1.logger.error(`Error uploading multiple files to Cloudinary: ${error.message}`);
        throw new appError_1.AppError(`Error uploading multiple files to Cloudinary: ${error.message}`, 500);
    }
};
exports.uploadMultipleToCloudinary = uploadMultipleToCloudinary;
//delete from local
const deleteLocalFile = (filePath) => {
    fs_1.default.unlink(filePath, (err) => {
        if (err)
            logger_1.logger.error(`Error deleting local file: ${err.message}`);
    });
};
exports.deleteLocalFile = deleteLocalFile;
// Delete file from Cloudinary
const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary_1.v2.uploader.destroy(publicId);
        return result;
    }
    catch (error) {
        logger_1.logger.error(`Error deleting from Cloudinary: ${error.message}`);
        throw new appError_1.AppError(`Error deleting file from Cloudinary: ${error.message}`, 500);
    }
};
exports.deleteFromCloudinary = deleteFromCloudinary;
// Delete multiple files from Cloudinary
const deleteMultipleFromCloudinary = async (publicIds) => {
    try {
        const result = await cloudinary_1.v2.api.delete_resources(publicIds);
        return result;
    }
    catch (error) {
        logger_1.logger.error(`Error deleting multiple files from Cloudinary: ${error.message}`);
        throw new appError_1.AppError(`Error deleting multiple files from Cloudinary: ${error.message}`, 500);
    }
};
exports.deleteMultipleFromCloudinary = deleteMultipleFromCloudinary;
// Get file information from Cloudinary
const getFileInfo = async (publicId) => {
    try {
        const result = await cloudinary_1.v2.api.resource(publicId);
        return result;
    }
    catch (error) {
        logger_1.logger.error(`Error getting file info from Cloudinary: ${error.message}`);
        throw new appError_1.AppError(`Error getting file info from Cloudinary: ${error.message}`, 500);
    }
};
exports.getFileInfo = getFileInfo;
// Create image upload middleware for specific entity
const createEntityImageUpload = (entityType) => {
    return async (req, res, next) => {
        (0, exports.uploadMultipleFiles)(req, res, async (err) => {
            if (err) {
                return next(new appError_1.AppError(`Error uploading ${entityType} images: ${err.message}`, 400));
            }
            if (!req.files || req.files.length === 0) {
                return next();
            }
            try {
                // Store file information in request for later use
                req.uploadedFiles = req.files.map((file) => ({
                    fieldname: file.fieldname,
                    originalname: file.originalname,
                    encoding: file.encoding,
                    mimetype: file.mimetype,
                    path: file.path,
                    size: file.size,
                    filename: file.filename,
                    destination: file.destination,
                }));
                next();
            }
            catch (error) {
                return next(new appError_1.AppError(`Error processing ${entityType} images: ${error.message}`, 500));
            }
        });
    };
};
exports.createEntityImageUpload = createEntityImageUpload;
// Helper to process uploaded files and save to database
const processUploadedFiles = async (files, entityId, entityType, prisma) => {
    try {
        const uploadPromises = files.map(async (file) => {
            const uploadResult = await (0, exports.uploadToCloudinary)(file.path, `trippz/${entityType}s`);
            // Create database record based on entity type
            const data = {
                file_url: uploadResult.url,
                file_type: file.mimetype,
            };
            // Set the appropriate entity ID field
            if (entityType === "hotel") {
                data.hotel_id = entityId;
            }
            else if (entityType === "flight") {
                data.flight_id = entityId;
            }
            else if (entityType === "trip") {
                data.trip_id = entityId;
            }
            else if (entityType === "user") {
                data.user_id = entityId;
            }
            // Create image record in database
            return await prisma.image.create({
                data,
            });
        });
        return await Promise.all(uploadPromises);
    }
    catch (error) {
        logger_1.logger.error(`Error processing uploaded files: ${error.message}`);
        throw new appError_1.AppError(`Error processing uploaded files: ${error.message}`, 500);
    }
};
exports.processUploadedFiles = processUploadedFiles;
//# sourceMappingURL=fileUpload.js.map
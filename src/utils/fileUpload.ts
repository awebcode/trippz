import multer from "multer"
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import { AppError } from "./appError"
import fs from "fs"
import path from "path"
import { logger } from "./logger"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Configure local storage for temporary files
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads")
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const ext = path.extname(file.originalname)
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`)
  },
})

// Configure Cloudinary storage
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "trippz",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx"],
    transformation: [{ width: 1000, height: 1000, crop: "limit" }],
  } as any,
})

// File filter function
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Define allowed MIME types
  const allowedImageTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"]
  const allowedDocumentTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]

  // Check if the file type is allowed
  if ([...allowedImageTypes, ...allowedDocumentTypes].includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new AppError("Unsupported file format. Only JPEG, PNG, GIF, PDF, DOC, and DOCX are allowed.", 400) as any)
  }
}

// Create multer instances
export const uploadLocal = multer({
  storage: localStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter,
})

export const uploadCloudinary = multer({
  storage: cloudinaryStorage as any,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter,
})

// Single file upload
export const uploadSingleFile = uploadCloudinary.single("file")

// Multiple files upload (max 10)
export const uploadMultipleFiles = uploadCloudinary.array("files", 10)

// Upload specific fields
export const uploadFields = (fields: { name: string; maxCount: number }[]) => {
  return uploadCloudinary.fields(fields)
}

// Upload file to Cloudinary directly
export const uploadToCloudinary = async (filePath: string, folder = "trippz") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "auto",
    })

    // Delete the local file after upload
    fs.unlink(filePath, (err) => {
      if (err) logger.error(`Error deleting local file: ${err.message}`)
    })

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
    }
  } catch (error: any) {
    logger.error(`Error uploading to Cloudinary: ${error.message}`)
    throw new AppError(`Error uploading file to Cloudinary: ${error.message}`, 500)
  }
}

// Upload multiple files to Cloudinary
export const uploadMultipleToCloudinary = async (filePaths: string[], folder = "trippz") => {
  try {
    const uploadPromises = filePaths.map((filePath) => uploadToCloudinary(filePath, folder))
    return await Promise.all(uploadPromises)
  } catch (error: any) {
    logger.error(`Error uploading multiple files to Cloudinary: ${error.message}`)
    throw new AppError(`Error uploading multiple files to Cloudinary: ${error.message}`, 500)
  }
}

//delete from local
export const deleteLocalFile = (filePath: string) => {
  fs.unlink(filePath, (err) => {
    if (err) logger.error(`Error deleting local file: ${err.message}`)
  })
}

// Delete file from Cloudinary
export const deleteFromCloudinary = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error: any) {
    logger.error(`Error deleting from Cloudinary: ${error.message}`)
    throw new AppError(`Error deleting file from Cloudinary: ${error.message}`, 500)
  }
}

// Delete multiple files from Cloudinary
export const deleteMultipleFromCloudinary = async (publicIds: string[]) => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds)
    return result
  } catch (error: any) {
    logger.error(`Error deleting multiple files from Cloudinary: ${error.message}`)
    throw new AppError(`Error deleting multiple files from Cloudinary: ${error.message}`, 500)
  }
}

// Get file information from Cloudinary
export const getFileInfo = async (publicId: string) => {
  try {
    const result = await cloudinary.api.resource(publicId)
    return result
  } catch (error: any) {
    logger.error(`Error getting file info from Cloudinary: ${error.message}`)
    throw new AppError(`Error getting file info from Cloudinary: ${error.message}`, 500)
  }
}

// Create image upload middleware for specific entity
export const createEntityImageUpload = (entityType: string) => {
  return async (req: any, res: any, next: any) => {
    uploadMultipleFiles(req, res, async (err) => {
      if (err) {
        return next(new AppError(`Error uploading ${entityType} images: ${err.message}`, 400))
      }

      if (!req.files || req.files.length === 0) {
        return next()
      }

      try {
        // Store file information in request for later use
        req.uploadedFiles = req.files.map((file: Express.Multer.File) => ({
          fieldname: file.fieldname,
          originalname: file.originalname,
          encoding: file.encoding,
          mimetype: file.mimetype,
          path: file.path,
          size: file.size,
          filename: file.filename,
          destination: file.destination,
        }))

        next()
      } catch (error: any) {
        return next(new AppError(`Error processing ${entityType} images: ${error.message}`, 500))
      }
    })
  }
}

// Helper to process uploaded files and save to database
export const processUploadedFiles = async (
  files: Express.Multer.File[],
  entityId: string,
  entityType: "hotel" | "flight" | "trip" | "user",
  prisma: any,
) => {
  try {
    const uploadPromises = files.map(async (file) => {
      const uploadResult = await uploadToCloudinary(file.path, `trippz/${entityType}s`)

      // Create database record based on entity type
      const data: any = {
        file_url: uploadResult.url,
        file_type: file.mimetype,
      }

      // Set the appropriate entity ID field
      if (entityType === "hotel") {
        data.hotel_id = entityId
      } else if (entityType === "flight") {
        data.flight_id = entityId
      } else if (entityType === "trip") {
        data.trip_id = entityId
      } else if (entityType === "user") {
        data.user_id = entityId
      }

      // Create image record in database
      return await prisma.image.create({
        data,
      })
    })

    return await Promise.all(uploadPromises)
  } catch (error: any) {
    logger.error(`Error processing uploaded files: ${error.message}`)
    throw new AppError(`Error processing uploaded files: ${error.message}`, 500)
  }
}

import bcrypt from "bcrypt"
import { prisma } from "../lib/prisma"
import { AppError } from "../utils/appError"
import { logger } from "../utils/logger"
import type { UpdateProfileInput, UpdatePasswordInput, AddAddressInput } from "../validators/userValidators"
import { uploadToCloudinary } from "../utils/fileUpload"
export class UserService {
  static async getProfile(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          Profile: true,
          addresses: true,
        },
      })

      if (!user) {
        throw new AppError("User not found", 404)
      }

      return {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role,
        email_verified: user.email_verified,
        phone_verified: user.phone_verified,
        date_of_birth: user.date_of_birth,
        address: user.address,
        profile_picture: user.profile_picture,
        profile: user.Profile,
        addresses: user.addresses,
      }
    } catch (error) {
      logger.error(`Error in getProfile: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to get user profile", 500)
    }
  }

  static async updateProfile(userId: string, data: UpdateProfileInput) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { Profile: true },
      })

      if (!user) {
        throw new AppError("User not found", 404)
      }

      // Update user data
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          first_name: data.first_name ?? user.first_name,
          last_name: data.last_name ?? user.last_name,
          date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : user.date_of_birth,
          address: data.address ?? user.address,
          Profile: {
            update: {
              bio: data.bio ?? user.Profile?.bio,
              theme: data.theme ?? user.Profile?.theme,
              language: data.language ?? user.Profile?.language,
            },
          },
        },
        include: {
          Profile: true,
        },
      })

      return {
        id: updatedUser.id,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        email: updatedUser.email,
        profile: updatedUser.Profile,
      }
    } catch (error) {
      logger.error(`Error in updateProfile: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to update user profile", 500)
    }
  }

  static async updatePassword(userId: string, data: UpdatePasswordInput) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new AppError("User not found", 404)
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(data.current_password, user.password_hash)
      if (!isPasswordValid) {
        throw new AppError("Current password is incorrect", 400)
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(data.new_password, salt)

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password_hash: hashedPassword },
      })

      return { message: "Password updated successfully" }
    } catch (error) {
      logger.error(`Error in updatePassword: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to update password", 500)
    }
  }

  static async uploadProfilePicture(userId: string, file: Express.Multer.File) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new AppError("User not found", 404)
      }

      // Upload file to Cloudinary
      const imageUrl = await uploadToCloudinary(file.path)

      // Update user profile picture
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { profile_picture: imageUrl.url },
      })

      return {
        id: updatedUser.id,
        profile_picture: updatedUser.profile_picture,
      }
    } catch (error) {
      logger.error(`Error in uploadProfilePicture: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to upload profile picture", 500)
    }
  }

  static async addAddress(userId: string, data: AddAddressInput) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new AppError("User not found", 404)
      }

      // Add new address
      const address = await prisma.address.create({
        data: {
          user_id: userId,
          address: data.address,
          city: data.city,
          country: data.country,
          postal_code: data.postal_code,
        },
      })

      return address
    } catch (error) {
      logger.error(`Error in addAddress: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to add address", 500)
    }
  }

  static async getAddresses(userId: string) {
    try {
      const addresses = await prisma.address.findMany({
        where: { user_id: userId },
      })

      return addresses
    } catch (error) {
      logger.error(`Error in getAddresses: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to get addresses", 500)
    }
  }

  static async deleteAddress(userId: string, addressId: string) {
    try {
      const address = await prisma.address.findUnique({
        where: { id: addressId },
      })

      if (!address) {
        throw new AppError("Address not found", 404)
      }

      if (address.user_id !== userId) {
        throw new AppError("You are not authorized to delete this address", 403)
      }

      await prisma.address.delete({
        where: { id: addressId },
      })

      return { message: "Address deleted successfully" }
    } catch (error) {
      logger.error(`Error in deleteAddress: ${error}`)
      if (error instanceof AppError) {
        throw error
      }
      throw new AppError("Failed to delete address", 500)
    }
  }
}

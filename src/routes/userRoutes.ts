import express from "express"
import { UserController } from "../controllers/userController"
import { protect } from "../middleware/authMiddleware"
import { validateRequest } from "../middleware/validateRequest"
import { updateProfileSchema, updatePasswordSchema, addAddressSchema } from "../validators/userValidators"
import { uploadSingleFile } from "../utils/fileUpload"

const router = express.Router()

// Protect all routes
router.use(protect)

router.get("/profile", UserController.getProfile)

router.put("/profile", validateRequest({ body: updateProfileSchema }), UserController.updateProfile)

router.put("/password", validateRequest({ body: updatePasswordSchema }), UserController.updatePassword)

router.post("/profile-picture", uploadSingleFile, UserController.uploadProfilePicture)

router.post("/addresses", validateRequest({ body: addAddressSchema }), UserController.addAddress)

router.get("/addresses", UserController.getAddresses)

router.delete("/addresses/:id", UserController.deleteAddress)

export { router as userRoutes }

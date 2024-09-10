import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  ragisterUser,
  refreshAccessToken,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,

} from "../contollers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.Middleware.js";
const router = Router();

router.route("/ragister").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  ragisterUser
);

router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyJwt, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").post(verifyJwt, changeCurrentPassword);

router.route("/current-user").get(verifyJwt, getCurrentUser);

router.route("/update-account").patch(verifyJwt, updateAccountDetails);

router
  .route("/upload-avatar")
  .patch(verifyJwt, upload.single("avatar"), updateUserAvatar);

router
  .route("/upload-coverimage")
  .patch(verifyJwt, upload.single("coverImage"), updateUserCoverImage);

router.route("/c/:username").get(verifyJwt, getUserChannelProfile);

router.route("/history").get(verifyJwt, getWatchHistory);

export default router;

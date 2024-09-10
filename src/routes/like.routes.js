import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.Middleware.js";
import { getLikedVideos, getTotalLikedOnAVideo, toggleCommentLike, toggleTweetLike, toggleVideoLike } from "../contollers/like.controller.js";

const router = Router();
router.use(verifyJwt)


router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getLikedVideos);


// get total likes for each video
router.route('/videos/:videoId/likes').get(getTotalLikedOnAVideo)
export default router;
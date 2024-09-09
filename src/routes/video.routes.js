import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.Middleware.js";
import { addVideo, deleteVideo, getAllVideos, getVideoDetailsById, togglePublishStatus, updateVideoDetails } from "../contollers/video.controller.js";

const router = Router();
router.use(verifyJwt);

router.route("/")
        .get(getAllVideos)
        .post(
            upload.fields([
              { name: "video", maxCount: 1 },
              { name: "thumbnail", maxCount: 1 },
            ]),
            addVideo
        );



router.route('/:videoId')
        .get(getVideoDetailsById)
  .delete(deleteVideo)
        .patch(updateVideoDetails)


router.route('/toggle/publish/:videoId')
        .patch(togglePublishStatus);


export default router;

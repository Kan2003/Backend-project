import { Router } from "express";
import { loginUser, logoutUser, ragisterUser, refreshAccessToken } from "../contollers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.Middleware.js";
const router = Router();

router.route('/ragister').post(
    upload.fields([
        {name : "avatar", maxCount: 1},
        {name : "coverImage", maxCount: 1}
    ]),
    ragisterUser
)

router.route('/login').post(loginUser)

// secured routes 
router.route('/logout').post(verifyJwt,logoutUser)

router.route('/refresh-token').post(refreshAccessToken)


export default router;
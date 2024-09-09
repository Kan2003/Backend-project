import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.Middleware.js";
import { toggleVideoLike } from "../contollers/like.controller.js";

const router = Router();
router.use(verifyJwt)


router.route("/toggle/v/:videoId").post(toggleVideoLike);



export default router;
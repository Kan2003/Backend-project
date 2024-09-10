import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.Middleware.js";
import { subscribed } from "../contollers/subscribe.controller.js";


const router = Router();
router.use(verifyJwt)


router.route("/:channelId").post(subscribed)

export default router;
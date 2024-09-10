import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.Middleware.js";
import { getSubscribedChannels, getSubscribers, toggleSubscription } from "../contollers/subscribe.controller.js";


const router = Router();
router.use(verifyJwt)


router.route("/:channelId").post(toggleSubscription)
.get(getSubscribers)


router.route('/').get(getSubscribedChannels)

export default router;
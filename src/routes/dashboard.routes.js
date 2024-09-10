import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.Middleware.js";
import { getChannelStats } from "../contollers/dashboard.controller.js";

const router = Router();
router.use(verifyJwt)


router.route('/stats').get(getChannelStats)


export default router;
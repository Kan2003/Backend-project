import { Router } from "express";
import { ragisterUser } from "../contollers/user.controller.js";

const router = Router();

router.route('/ragister').post(ragisterUser)

export default router;
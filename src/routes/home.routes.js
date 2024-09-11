import { Router } from "express";
import { home } from "../contollers/home.controller.js";

const router = Router();



router.route('/').get(home)


export default router;
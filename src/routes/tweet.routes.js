import mongoose from "mongoose";
import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.Middleware.js";
import {
  createTweet,
  deleteTweet,
  getUsertweets,
  updatedTweet,
} from "../contollers/tweet.controller.js";

const router = Router();
router.use(verifyJwt);

router.route("/").post(createTweet);

router.route("/user/:userId").get(getUsertweets);

router.route("/:tweetId").patch(updatedTweet).delete(deleteTweet);

export default router;

import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const videoId = req.params.videoId;
  const user = req.user._id;
  try {
    if (!videoId) {
      throw new ApiError("Invalid video ID", 400);
    }

    const videoLike = await Like.create({
      video: new mongoose.Types.ObjectId(videoId),
      user,
    });

    res
      .status(201)
      .json(new ApiResponse(201, "Video liked successfully", videoLike));
  } catch (error) {
    throw new ApiError(404, error.message);
  }
});

export { toggleVideoLike };

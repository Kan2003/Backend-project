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
    //  console.log(videoId, user)
    const existingLike = await Like.findOne({
      video: new mongoose.Types.ObjectId(videoId),
      likedBy: user,
    });
    // console.log(existingLike)
    if (existingLike) {
      await existingLike.deleteOne();
      return res
        .status(200)
        .json(new ApiResponse(200, "Video unliked successfully", existingLike));
    }

    const videoLike = await Like.create({
      video: new mongoose.Types.ObjectId(videoId),
      likedBy: user,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, "Video liked successfully", videoLike));
  } catch (error) {
    throw new ApiError(404, error.message);
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const commentId = req.params.commentId;
  const user = req.user._id;
  try {
    if (!commentId) {
      throw new ApiError("Invalid comment ID", 400);
    }

    const existingLike = await Like.findOne({
      comment: new mongoose.Types.ObjectId(commentId),
      likedBy: user,
    });

    if (existingLike) {
      await existingLike.deleteOne();
      return res
        .status(200)
        .json(
          new ApiResponse(200, "comment unliked successfully", existingLike)
        );
    }

    const commentLike = await Like.create({
      comment: new mongoose.Types.ObjectId(commentId),
      likedBy: user,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, "comment liked successfully", commentLike));
  } catch (error) {
    throw new ApiError(404, error.message);
  }
});
const toggleTweetLike = asyncHandler(async (req, res) => {
  const tweetId = req.params.tweetId;
  const user = req.user._id;
  try {
    if (!tweetId) {
      throw new ApiError("Invalid tweetId", 400);
    }

    const existingLike = await Like.findOne({
      tweet: new mongoose.Types.ObjectId(tweetId),
      likedBy: user,
    });

    if (existingLike) {
      await existingLike.deleteOne();
      return res
        .status(200)
        .json(new ApiResponse(200, "tweet unliked successfully", existingLike));
    }

    const tweetlike = await Like.create({
      tweet: new mongoose.Types.ObjectId(tweetId),
      likedBy: user,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, "tweet liked successfully", tweetlike));
  } catch (error) {
    throw new ApiError(404, error.message);
  }
});

// get liked video by user
const getLikedVideos = asyncHandler(async (req, res) => {
    const user = req.user._id;
    try {
        const LikedVideo = await Like.find({
            likedBy: user,
            video : { $exists: true}
        }).populate('video', 'tittle description')

        //  or we can use pipeline to extract video details

        if(!LikedVideo) {
            throw new ApiError("No liked videos found", 404);
        }

    

        return res.status(200).json(new ApiResponse(200, "Liked videos fetched successfully", LikedVideo));
    } catch (error) {
        throw new ApiError(404, error.message);
    }
})
// get total likes on a video
const getTotalLikedOnAVideo = asyncHandler(async (req, res) => {
    const videoId = req.params.videoId;
    try {
        if(!videoId){
            throw new ApiError(" video ID not found", 400);
        }

        const likes = await Like.aggregate([
            {
                $match: 
                {
                    video : new mongoose.Types.ObjectId(videoId)
                }
            },
            {
                $lookup:
                {
                    from : 'users',
                    localField: 'likedBy',
                    foreignField: '_id',
                    as: 'userdetails'
                }
            },
            {
                $addFields: {
                    likeCount: {
                        $size: '$userdetails'
                    },
                    userdetails : {
                        $first : '$userdetails'
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    video : 1,
                    likeCount: 1,
                    likedBy: 1,
                    createdAt: 1,
                    userdetails: {
                    username : 1,
                    avatar : 1
                    }
                }
            }
        ])

        return res.status(200).json(new ApiResponse(200, "Total likes fetched successfully", likes));
    } catch (error) {
        throw new ApiError(404, error.message);
    }

})


export { toggleVideoLike, toggleCommentLike, toggleTweetLike , getLikedVideos , getTotalLikedOnAVideo};

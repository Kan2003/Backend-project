import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.model.js";

const createTweet = asyncHandler(async (req, res) => {
  const text = req.body.content;

  if (!text) {
    throw new ApiError(400, "Content is required");
  }

  const user = req.user._id;
  const tweet = await Tweet.create({
    content: text,
    owner: user,
  });

  if (!tweet) {
    throw new ApiError(500, "Failed to create tweet");
  }

  res
    .status(201)
    .json(new ApiResponse(true, "Tweet created successfully", tweet));
});

const getUsertweets = asyncHandler(async (req, res) => {
  const user = req.params.userId;
console.log(user)
  const tweets = await Tweet.aggregate([
    {
      $match: { owner: new mongoose.Types.ObjectId(user) },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$ownerDetails",
        },
      },
    },
    {
      $project: {
        content: 1,
        createdAt: 1,
        owner: {
          _id: 1,
          username: 1,
          avatar: 1,
        },
      },
    },
  ]);

  if (!tweets) {
    throw new ApiError(500, "Failed to fetch tweets");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "Tweets fetched successfully", tweets));
});

const updatedTweet = asyncHandler(async (req, res) => {
  const tweetId = req.params.tweetId;
  const text = req.body.content;

  if (!(text && tweetId)) {
    throw new ApiError(400, "Content & id is required");
  }

  const tweet = await Tweet.findByIdAndUpdate(
    {_id : new mongoose.Types.ObjectId(tweetId)},
    { content: text },
    { new: true }
  );

  if(!tweet){
    throw new ApiError(404, "Tweet not found");
  }

  return res.status(200).json(new ApiResponse(true, "Tweet updated successfully", tweet));
});

const deleteTweet = asyncHandler(async (req, res) => {
    const tweetId = req.params.tweetId;
    
    if(!tweetId){
        throw new ApiError(400, "Id is required");
    }

    const tweet = await Tweet.findByIdAndDelete({
        _id : new mongoose.Types.ObjectId(tweetId)
    });

    return res.status(200).json(new ApiResponse(true, "Tweet deleted successfully",tweet))
})

export { createTweet, getUsertweets, updatedTweet , deleteTweet};

import { Subscription } from "../models/subcription.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const getChannelStats = asyncHandler(async (req, res) => {
  const channelId = req.user._id;

  try {
    console.log(channelId);
    const aboutChannel = await User.aggregate([
      {
        $match: { _id: channelId },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "channel",
          as: "subscribedUsers",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "subscriberDetails",
              },
            },
            {
              $addFields: {
                subscriberDetails: {
                  $first: "$subscriberDetails",
                },
              },
            },
            {
              $project: {
                username: 1,
                _id: 1,
                avatar: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          subscriberCount: {
            $size: "$subscribedUsers",
          },
        },
      },
      {
        $project: {
          _id: 1,
          subscriberCount: 1,
          avatar: 1,
          username: 1,
          fullname: 1,
          thumbnail: 1,
          watchHistory: 1,
          subscribedUsers: {
            $map: {
              input: "$subscribedUsers",
              as: "user",
              in: {
                _id: "$$user._id",
                username: "$$user.subscriberDetails.username",
                avatar: "$$user.subscriberDetails.avatar",
              },
            },
          },
        },
      },
    ]);
    console.log(aboutChannel);
    return res
      .status(200)
      .json(new ApiResponse(200, "Channel Stats", aboutChannel[0]));
  } catch (error) {
    throw new ApiError(error.message, 500);
  }
});

export { getChannelStats };

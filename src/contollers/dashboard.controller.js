import { Subscription } from "../models/subcription.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const getChannelStats = asyncHandler(async (req, res) => {
  const channelId = req.user._id;

  try {
    // console.log(channelId);

    const aboutChannel = await User.aggregate([
      {
        $match: { _id: channelId },
      },
      // subscriber detils
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
                localField: "subscriber",
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
                _id: 1,
                subscriber: 1,
                createdAt: 1,
                "subscriberDetails._id": 1,
                "subscriberDetails.username": 1,
                "subscriberDetails.fullname": 1,
                "subscriberDetails.avatar": 1,
              },
            },
          ],
        },
      },
      // channel susbscribed by user details
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "subscriber",
          as: "SubscribedChannels",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelDetails",
              },
            },
            {
              $addFields: {
                channelDetails: {
                  $first: "$channelDetails",
                },
              },
            },
            {
              $project: {
                _id: 1,
                channel: 1,
                createdAt: 1,
                "channelDetails._id": 1,
                "channelDetails.username": 1,
                "channelDetails.fullname": 1,
                "channelDetails.avatar": 1,
              },
            },
          ],
        },
      },
      // total videos
      {
        $lookup: {
          from : 'videos',
          localField: '_id',
          foreignField: 'owner',
          as: 'videos',
          pipeline : [
            {
              $project : {
                _id : 1,
                videoFile: 1,
                thumbnail: 1,
                tittle: 1,
                createdAt: 1,
                isPublished: 1,
                views: 1,
              }
            }
          ]
        },
      },
      // total likes count on  comment , video & tweets -- worked on it 
      {
        $addFields: {
          subscriberCount: {
            $size: "$subscribedUsers",
          },
          SubscribedChannelsCount: {
            $size: "$SubscribedChannels",
          },
          totalVideos: {
            $size: "$videos",
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
          subscribedUsers: 1,
          videos : 1,
          likes: 1,
          SubscribedChannels: 1,
          SubscribedChannelsCount: 1,
          totalVideos: 1,
          likesOnComments: {
            $size: {
              $filter: {
                input: "$likes",
                as: "like",
                cond: { $ne: ["$$like.comment", null] },
              },
            },
          },
          
        },
      },
    ]);
    return res
      .status(200)
      .json(new ApiResponse(200, "Channel Stats", aboutChannel[0]));
  } catch (error) {
    throw new ApiError(error.message, 500);
  }
});



export { getChannelStats };

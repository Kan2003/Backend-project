import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!(name && description)) {
    throw new ApiError(400, "Please provide name and description");
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  });

  if (!playlist) {
    throw new ApiError(500, "Failed to create playlist");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "playlist created successfully", playlist));
});

const getAllPlaylists = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const playlists = await Playlist.aggregate([
    {
      $match: {
        owner: userId,
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videosInfo",
      },
    },
    {
      $addFields: {
        totalVideos: {
          $size: "$videosInfo",
        },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        owner: 1,
        totalVideos: 1,
        videosInfo: {
          $map: {
            input: "$videosInfo",
            as: "video",
            in: {
              _id: "$$video._id",
              title: "$$video.title",
              duration: "$$video.duration",
              createdAt: "$$video.createdAt",
              videoFile: "$$video.videoFile",
              thumbnail: "$$video.thumbnail",
            },
          },
        },
      },
    },
  ]);

  return res.json(
    new ApiResponse(200, "playlists fetched successfully", playlists)
  );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  try {
    const playlistId = req.params.playlistId;

    if (!playlistId) {
      throw new ApiError(400, "Please provide playlist id");
    }
    // console.log(playlistId)
    const playlist = await Playlist.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(playlistId),
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "videos",
          foreignField: "_id",
          as: "videosInfo",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "ownerInfo",
        },
      },
      {
        $addFields: {
          totalVideos: {
            $size: "$videosInfo",
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          totalVideos: 1,
          videosInfo: {
            $map: {
              input: "$videosInfo",
              as: "video",
              in: {
                _id: "$$video._id",
                title: "$$video.title",
                duration: "$$video.duration",
                createdAt: "$$video.createdAt",
                videoFile: "$$video.videoFile",
                thumbnail: "$$video.thumbnail",
              },
            },
          },
          ownerId: { $arrayElemAt: ["$ownerInfo._id", 0] },
          ownerUsername: { $arrayElemAt: ["$ownerInfo.username", 0] },
          ownerAvatar: { $arrayElemAt: ["$ownerInfo.avatar", 0] },
        },
      },
    ]);

    // console.log(playlist)
    return res
      .status(200)
      .json(new ApiResponse(200, "playlist fetched successfully", playlist));
  } catch (error) {
    throw new ApiError(500, "Failed to fetch playlist", error);
  }
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const playlistId = req.params.playlistId;
  const { name, description } = req.body;

  try {
    if (!(playlistId && name && description)) {
      throw new ApiError(
        400,
        "Please provide playlist id & name and description"
      );
    }

    const playlist = await Playlist.findByIdAndUpdate(
      { _id: new mongoose.Types.ObjectId(playlistId) },
      {
        $set: {
          name,
          description,
        },
      },
      { new: true }
    );

    return res.json(
      new ApiResponse(200, "playlist updated successfully", playlist)
    );
  } catch (error) {
    throw new ApiError(500, "Failed to update playlist", error);
  }
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const playlistId = req.params.playlistId;

  const playlist = await Playlist.findByIdAndDelete({
    _id: new mongoose.Types.ObjectId(playlistId),
  });

  return res.json(
    new ApiResponse(200, "playlist deleted successfully", playlist)
  );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!(playlistId && videoId)) {
    throw new ApiError(400, "Please provide playlist id and video id");
  }

  const checkPlaylistExists = await Playlist.findById({
    _id: new mongoose.Types.ObjectId(playlistId),
  });

  if (!checkPlaylistExists) {
    throw new ApiError(404, "Playlist not found");
  }

  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: {
        videos: new mongoose.Types.ObjectId(videoId),
      },
    },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(500, "Failed to add video to playlist");
  }

  return res.json(
    new ApiResponse(200, "video added to playlist successfully", playlist)
  );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!(playlistId && videoId)) {
    throw new ApiError(400, "Please provide playlist id and video id");
  }

  const playlist = await Playlist.findByIdAndUpdate(
    { _id: new mongoose.Types.ObjectId(playlistId) },
    {
      $pull: {
        videos: new mongoose.Types.ObjectId(videoId),
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, "video removed from playlist successfully", playlist)
    );
});

export {
  createPlaylist,
  getAllPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  updatePlaylist,
  deletePlaylist,
  removeVideoFromPlaylist,
};

import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadImage, uploadVideo } from "../utils/cloudinary.js";

// const addVideo = asyncHandler(async (req, res) => {
//     // get all details related to video from request body
//     // check the required fields and validate them
//     // upload video on cloudinary
//     // get the video duration from cloudinary
//     // save video details in database
//     // return success message with video details

//     const {tittle , description } = req.body;

//     if(!(tittle && description)) {
//         return new ApiError(400 , 'tittle and description are required');
//     }

//     console.log(req.files)
//     const videoLocalPath = req.files?.video[0]?.path
//     console.log('videolocalpath',videoLocalPath)

//     const thumbnailLocalPath = req.files?.thumbnail[0]?.path

//     if(!(videoLocalPath ||thumbnailLocalPath)){
//         return new ApiError(400 , 'video and thumbnail are required');
//     }

//     const video = await uploadVideo(videoLocalPath)

//     console.log('uploaded video', video)
//     const thumbnail = await uploadImage(thumbnailLocalPath)

//     if(!(video && thumbnail)) {
//         return new ApiError(500 , 'failed to upload video & thumbnail')
//     }

//     const videoDuration = video.duration;

//     if(!videoDuration){
//         return new ApiError(500 , 'failed to get video duration')
//     }

//     const videoData = await Video.create({
//         tittle,
//         description,
//         video: video.url,
//         thumbnail: thumbnail.url,
//         duration: videoDuration
//     })

//     return res.status(200)
//     .json(new ApiResponse(200, 'Video added successfully', videoData));

// })

const addVideo = asyncHandler(async (req, res) => {
  // console.log('req.files', req.files)
  const { tittle, description } = req.body;
  const user = req.user._id;

  if (!user) {
    throw new ApiError(401, "Unauthorized. Please log in");
  }

  if (!(tittle && description)) {
    throw new ApiError(400, "Title and description are required");
  }

  // console.log('req.body',req.body);
  const videoLocalPath = req.files?.video?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  // console.log(videoLocalPath)

  if (!(videoLocalPath && thumbnailLocalPath)) {
    throw new ApiError(400, "Video and thumbnail are required");
  }

  try {
    const video = await uploadVideo(videoLocalPath);
    // console.log("Uploaded video:", video);

    const thumbnail = await uploadImage(thumbnailLocalPath);
    if (!(video && thumbnail)) {
      throw new ApiError(500, "Failed to upload video & thumbnail");
    }

    const videoDuration = video.duration;
    if (!videoDuration) {
      throw new ApiError(500, "Failed to get video duration");
    }

    const videoData = await Video.create({
      tittle: tittle,
      description: description,
      videoFile: video.url,
      thumbnail: thumbnail.url,
      duration: videoDuration,
      owner: user,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, "Video added successfully", videoData));
  } catch (error) {
    console.error("Error occurred:", error);
    throw new ApiError(
      500,
      "An error occurred during the video upload process"
    );
  }
});

const getVideoDetailsById = asyncHandler(async (req, res) => {
  const videoId = req.params.videoId;

  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }

  const video = await Video.findById(videoId);

  console.log(video);

  const videoData = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.params.videoId),
      },
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
  ]);

  // console.log("videoDetails is -", videoData[0]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Video details fetched successfully", videoData[0])
    );
});

const updateVideoDetails = asyncHandler(async (req, res) => {
  const { tittle, description } = req.body;
  // console.log(req.body);
  // console.log(tittle, description);

  const videoId = req.params.videoId;
  // console.log(videoId);
  if (!tittle) {
    throw new ApiError(400, "tittle and description are required");
  }
  // console.log(videoId);

  if (!videoId) {
    throw new ApiError(400, "Video ID not found");
  }

  const video = await Video.findByIdAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(videoId),
    },
    {
      $set: { tittle, description },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Video details updated successfully", video));
});

export { addVideo, getVideoDetailsById, updateVideoDetails };

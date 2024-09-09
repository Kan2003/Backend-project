import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const addComment = asyncHandler(async (req, res) => {
  const videoId = req.params.videoId;

  const content = req.body.content;

  if (!videoId) {
    throw new ApiError(404, "video id not found");
  }

  const video = await Video.findById(videoId);

  const added = await Comment.create({
    content,
    video: new mongoose.Types.ObjectId(videoId),
    owner: video.owner,
  });

  if (!added) {
    throw new ApiError(500, "comment not added");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "comment added successfully", added));
});

const getComments = asyncHandler(async(req , res) => {
    const videoId = req.params.videoId;

    if (!videoId) {
      throw new ApiError(404, "video id not found");
    }

    const comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup : {
                from : 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'ownerdetails'
            }
        },
        {
            $project: {
                _id: 1,
                content: 1,
                createdAt: 1,
                username : '$ownerdetails.username'
            }
        }
    ])

    if(!comments){
        throw new ApiError(404, "comments not found");
    }


    return res.status(200).json(new ApiResponse(200, "comments fetched successfully", comments));
})


const updateComment = asyncHandler(async (req, res) => {

    const commentId = req.params.commentId;
    const content = req.body.content;


    if (!commentId) {
        throw new ApiError(404, "comment id not found");
    }

    const updateComment = await Comment.findByIdAndUpdate(
        commentId,
        { content },
        { new: true }
    )


    if (!updateComment) {
        throw new ApiError(500, "comment not updated");
    }

    return res
       .status(200)
       .json(new ApiResponse(200, "comment updated successfully", updateComment));
})



const deleteComment = asyncHandler(async (req, res) => {
    const commentId = req.params.commentId;

    if (!commentId) {
        throw new ApiError(404, "comment id not found");
    }


    const comment = await Comment.findByIdAndDelete(commentId)

    return res.status(200).json(new ApiResponse(200, "comment deleted successfully", comment));
})

export { addComment , getComments , updateComment , deleteComment};

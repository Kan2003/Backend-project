import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";



const home = asyncHandler(async(req , res) => {

    const videos = await Video.find().select('-duration -description ').populate('owner' , 'username avatar ')

    return res.status(200)
    .json(new ApiResponse(200, "Home page fetched successfully", videos))
})


export {home}
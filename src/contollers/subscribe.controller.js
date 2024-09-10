import mongoose from "mongoose";
import { Subscription } from "../models/subcription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"


const subscribed = asyncHandler( async(req ,res) => {
    try {
        const userId = req.user._id;
        const channelId = req.params.channelId;
    
        if(!userId){
            throw new ApiError(400, 'user not found')
        }
    
        if(!channelId){
            throw new ApiError(400, 'channel not found')
        }
        console.log(userId , channelId)
        const existingSubscription = await Subscription.findOne({
            channel : new mongoose.Types.ObjectId(channelId)  ,
            subscriber : userId
        })
    
        if(existingSubscription){
            await existingSubscription.deleteOne();
            return res.status(201)
            .json(new ApiResponse(200 , 'unsubscibe this channel succesfully', existingSubscription))
        }
    
        const subscribe = await Subscription.create({
            channel : new mongoose.Types.ObjectId(channelId),
            subscriber : userId
        })
    
        // console.log('subscriber ' , subscribe)
    
        if(!subscribe){
            throw new ApiError(500, 'Failed to subscribe')
        }
    
        return res.status(201)
        .json(new ApiResponse(200 , 'Subscribed successfully', subscribe))
    } catch (error) {
        throw new ApiError(error.status || 500, error.message)
    }
})


export { subscribed }
import mongoose from "mongoose";
import { Subscription } from "../models/subcription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler( async(req ,res) => {
    try {
        const userId = req.user._id;
        const channelId = req.params.channelId;
    
        if(!userId){
            throw new ApiError(400, 'user not found')
        }
    
        if(!channelId){
            throw new ApiError(400, 'channel not found')
        }
        // console.log(userId , channelId)
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


// controller to return subscriber list of a channel 
const getSubscribers = asyncHandler( async(req ,res) => {
    const channelId = req.params.channelId

    if(!channelId){
        throw new ApiError(400, 'channel not found')
    }

    const channel = await Subscription.aggregate([
        {
            $match : {
                channel : new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup : {
                from : "users",
                localField : "subscriber",
                foreignField : "_id",
                as : "subscriberInfo"
            }
        },
        {
            $project : {
                _id : 1,
                subscriberId : { $arrayElemAt : ["$subscriberInfo._id", 0]  },
                subscriberUsername : { $arrayElemAt : ["$subscriberInfo.username", 0]  },
                subscriberAvatar : { $arrayElemAt : ["$subscriberInfo.avatar", 0]  },
            }
        }
    ])

    return res.status(200)
    .json(new ApiResponse(200 , 'Subscribers of this channel', channel))
})

// controller to return channel list to which user has subscribed

const getSubscribedChannels = asyncHandler( async(req ,res) => {
    const subscriberId = req.user.id;

    if(!subscriberId){
        throw new ApiError(400, 'user not found')
    }


    const channels = await Subscription.aggregate([
        {
            $match : {
                subscriber : new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup : {
                from : "users",
                localField : "subscriber",
                foreignField : "_id",
                as : "subscriberInfo"
            }
        },
        {
             $project : {
                _id : 1,
                subscriberId : { $arrayElemAt : ["$subscriberInfo._id", 0]  },
                subscriberUsername : { $arrayElemAt : ["$subscriberInfo.username", 0]  },
                subscriberAvatar : { $arrayElemAt : ["$subscriberInfo.avatar", 0]  },
             }
        }
    ])


    return res.status(200)
    .json(new ApiResponse(200 , 'Channels to which you have subscribed', channels))
})


export { toggleSubscription , getSubscribers , getSubscribedChannels}
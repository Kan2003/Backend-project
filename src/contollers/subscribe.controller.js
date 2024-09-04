import { Subscription } from "../models/subcription.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"


const subscribed = asyncHandler( async(req ,res) => {
    
    const userId = req.user._id;
    // console.log(req.user)
    const channelName = req.params.channelName;
    // console.log(userId, channelName)

    const channel = await User.findOne({ username : channelName });
    // console.log('channel details' , channel)

    const channelId = channel?._id;
    // console.log('channel id ' , channelId)

    if(!userId){
        throw new ApiError(400, 'user not found')
    }

    if(!channelId){
        throw new ApiError(400, 'channel not found')
    }

    const existingSubscription = await Subscription.findOne({
        channel : channelId,
        subscriber : userId
    })

    if(existingSubscription){
        throw new ApiError(400, 'Already subscribed')
    }

    const subscribe = await Subscription.create({
        channel : channelId,
        subscriber : userId
    })

    // console.log('subscriber ' , subscribe)

    if(!subscribe){
        throw new ApiError(500, 'Failed to subscribe')
    }

    res.status(201)
    .json(new ApiResponse(200 , 'Subscribed successfully', subscribe))


})


export { subscribed }
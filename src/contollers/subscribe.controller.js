import { Subscription } from "../models/subcription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js"


const subscribed = asyncHandler(async(req ,res) => {
    
    const {username} = req.body;
    console.log(req.body)
    const channelName = req.params.channelName;
    console.log(username, channelName)
    if(!username?.trim()){
        throw new ApiError(400, 'username not found')
    }

    if(!channelName?.trim()){
        throw new ApiError(400, 'channel name not found')
    }

    const existingSubscription = await Subscription.findOne({
        channel : channelName,
        subscriber : username
    })

    if(existingSubscription){
        throw new ApiError(400, 'Already subscribed')
    }

    const subscribe = await Subscription.create({
        channel : channelName,
        subscriber : username
    })

    console.log(subscribe)

    if(!subscribe){
        throw new ApiError(500, 'Failed to subscribe')
    }

    res.status(201)
    .json(new ApiResponse(200 , 'Subscribed successfully', subscribe))


})


export { subscribed }
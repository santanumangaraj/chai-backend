import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const toggleSubscription = asyncHandler (async (req , res)=>{
    const {channelId} = req.params
    const subscriberId = req.user?._id

    if(!channelId){
        throw new ApiError(400,"Channel id is required")
    }
    
    if(!subscriberId){
        throw new ApiError(400,"Unable to fetch subscriber details")
    }

    
    const existingSubscriber = await Subscription.findOne({
        channel:channelId,
        subscriber:subscriberId
    })
    
    if(channelId == subscriberId){
        throw new ApiError(400,"Subscriber can't subscribed to their channel")
    }

    let subscriptionDetails,message;

    if(!existingSubscriber){
        subscriptionDetails = await Subscription.create({
            channel:channelId,
            subscriber:subscriberId
        })
        message="Channel Subscribed successfully"
    }else if(existingSubscriber){
        subscriptionDetails = await Subscription.findByIdAndDelete(
        existingSubscriber._id
        )
        message="Channel Unubscribed successfully"
    }else{
        subscriptionDetails = null;
        message="Channel not found"
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,
            subscriptionDetails
            ,message)
    )
})

const getSubscribedChannel = asyncHandler(async (req, res)=>{
    const {subscriberId} = req.params

    if(!subscriberId){
        throw new ApiError(400,"Channel id is required")
    }

    const subscribedChannel = await Subscription.find(
        {
            subscriber:subscriberId
        }
    )

    if(!subscribedChannel){
        throw new ApiError(400,"unable to fetch user subscribed channels")
    }

    const totalSubscribedChannel = await Subscription.countDocuments(
        {
            subscriber:subscriberId
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                totalSubscribedChannel,
                subscribedChannel
            },
            "user subscribed channel fetch successfully")
    )

})  

const getUserChannelSubscibers= asyncHandler(async (req, res)=>{
    const {channelId} = req.params

    if(!channelId){
        throw new ApiError(400,"Channel id is required")
    }

    const channelSubscribers = await Subscription.find({
        channel:channelId
    })

    if(!channelSubscribers){
        throw new ApiError(400,"Error occurd while fetching subscribers details")
    }

    const totalChannelSubscribers = await Subscription.countDocuments({
        channel:channelId
    })

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
        {
            totalChannelSubscribers,
            channelSubscribers
        },
        "User channel subscribers details fetched successfully"
    )
    )

})

export {
    toggleSubscription,
    getSubscribedChannel,
    getUserChannelSubscibers
}
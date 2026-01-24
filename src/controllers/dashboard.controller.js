import {Video} from "../models/video.model.js";
import {Like} from "../models/like.model.js";
import { Subscription } from "../models/subscription.model.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";


const getChannelStats = asyncHandler(async (req , res)=>{
    const userId = req.user?._id

    if(!userId){
        throw new ApiError(404,"User not found")
    }

    const videoStats = await Video.aggregate([
        {
            $match:{
                owner:userId
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"video",
                as:"likes"
            }
        },
        {
            $group:{
                _id:null,
                totalVideos:{$sum: 1},
                totalViews:{$sum:"$views"},
                totalLikes:{$sum:{$size:"$likes"}}
            }
        }

    ])



    const totalSubscribers = await Subscription.countDocuments({
        channel:userId
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200,
            {
                totalVideos: videoStats[0]?.totalVideos || 0,
                totalViews: videoStats[0]?.totalViews || 0,
                totalLikes: videoStats[0]?.totalLikes || 0,
                totalSubscribers,
            }
        )
    )
})

const getChannelVideos = asyncHandler(async (req , res)=>{
    const userId = req.user?._id

    if(!userId){
        throw new ApiError(400,"User id doesn't exists")
    }

    const getVideos = await Video.find({owner:userId})

    if(!getVideos){
        throw new ApiError(404,"No videos found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            getVideos,
            "Channel videos fetched successfully"
        )
    )

})

export {getChannelStats,getChannelVideos}
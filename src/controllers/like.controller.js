import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleCommentLike = asyncHandler(async (req, res)=>{
    const {commentId} = req.params

    if(!commentId){
        throw new ApiError(400,"Comment id is required")
    }

    const existingCommentLike = await Like.findOne(
        {
            comment:commentId,
            likedby:req.user?._id
        }
    )
    
    let commentLikeDetails,msg;
    
    if(!existingCommentLike){
        commentLikeDetails = await Like.create(
            {
                comment:commentId,
                likedby:req.user?._id
            }
        )
        msg = "Comment liked successfully"
    }else if(existingCommentLike){
        commentLikeDetails = await Like.findByIdAndDelete(
            existingCommentLike._id
        )
        msg = "Comment unliked successfully"
    }else{
        commentLikeDetails = null;
        msg = "Comment not found"
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,commentLikeDetails,msg)
    )
})

const toggleVideoLike = asyncHandler(async (req, res)=>{
    const {videoId} = req.params

    if(!videoId){
        throw new ApiError(400,"video id is required")
    }

    const existingVideoLike = await Like.findOne(
        {
            video:videoId,
            likedby:req.user?._id
        }
    )
    
    let videoLikeDetails,msg;
    
    if(!existingVideoLike){
        videoLikeDetails = await Like.create(
            {
                video:videoId,
                likedby:req.user?._id
            }
        )
        msg = "Video liked successfully"
    }else if(existingVideoLike){
        videoLikeDetails = await Like.findByIdAndDelete(
            existingVideoLike._id
        )
        msg = "Video unliked successfully"
    }else{
        existingVideoLike = null;
        msg = "Video not found"
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,videoLikeDetails,msg)
    )
})

const toggleTweetlike = asyncHandler(async (req, res)=>{
    const {tweetId} = req.params

    if(!tweetId){
        throw new ApiError(400,"tweet id is required")
    }

    const existingTweetLike = await Like.findOne(
        {
            tweet:tweetId,
            likedby:req.user?._id
        }
    )
    
    let tweetLikeDetails,msg;
    
    if(!existingTweetLike){
        tweetLikeDetails = await Like.create(
            {
                tweet:tweetId,
                likedby:req.user?._id
            }
        )
        msg = "Tweet liked successfully"
    }else if(existingTweetLike){
        tweetLikeDetails = await Like.findByIdAndDelete(
            existingTweetLike._id
        )
        msg = "Tweet unliked successfully"
    }else{
        existingTweetLike = null;
        msg = "Tweet not found"
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,tweetLikeDetails,msg)
    )
})

const getLikedVideos = asyncHandler(async (req,res)=>{

    const likedVideos = await Like.aggregate([
        {
            $match:{
                likedby: req.user?._id,
                video: {$ne : null}
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
            }
        },
        {
            $unwind:"$video"
        },
        {
            $addFields:{
                isOwner:{
                    $eq:["$video.owner", req.user._id]
                }
            }
        },
        {
            $project:{
                video:1,
                likedby:1,
                isOwner:1
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200,likedVideos,"Liked videos data fetched successfully")
    )
})

export {
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetlike,
    getLikedVideos
}
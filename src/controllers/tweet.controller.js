import { Tweet } from "../models/tweet.model.js";
import {User} from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createTweet = asyncHandler(async (req , res)=>{
    const {content} = req.body
    const owner = req.user?._id

    if (!content){
        throw new ApiError(400,"Content field is required")
    }

    if (!owner){
        throw new ApiError(400,"owner id not found")
    }

    const tweet = await Tweet.create(
        {
            owner:owner,
            content:content
        },
    )

    if (!tweet){
        throw new ApiError(400,"Something went wrong while uploading the tweet!!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,tweet,"Tweet upload successfully")
    )
})

const getUserTweet = asyncHandler(async (req, res)=>{
    const {userId} = req.params

    if(!userId){
        throw new ApiError(400,"User id is required")
    }

    const userTweet = await Tweet.find(
        {
            owner:userId
        }
    )

    if(!userTweet){
        throw new ApiError(400,"unable to fetch user tweets")
    }

    const totalUserTweet = await Tweet.countDocuments(
        {
            owner:userId
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                totalUserTweet,
                userTweet
            },
            "user tweets fetch successfully"
        )
    )
})

const updateTweet = asyncHandler(async (req, res)=>{
    const {newContent} = req.body
    const {tweetId} = req.params

    if(!tweetId){
        throw new ApiError(400,"Tweet id is required")
    }

    if(!(newContent || newContent.trim())){
        throw new ApiError(400,"Tweet content is required")
    }


    const tweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set:{
                content:newContent
            }
        },
        {new:true}
    )

    if(!tweet){
        throw new ApiError(400,"Something went wrong while updating the tweet!!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,tweet,"Tweet content updated successfully")
    )
})

const deleteTweet = asyncHandler(async (req , res) =>{

    const {tweetId} = req.params

    if(!tweetId){
        throw new ApiError(400,"Tweet id is required")
    }

    const tweet = await Tweet.findByIdAndDelete(
        tweetId
    )

    if(!tweet){
        throw new ApiError(400,"Tweet isn't deleted successfully")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,tweet,"Tweet deleted Successfully")
    )
})


export {
    createTweet,
    getUserTweet,
    updateTweet,
    deleteTweet
}


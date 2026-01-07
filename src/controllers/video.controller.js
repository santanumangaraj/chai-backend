import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";
import { upload } from "../middlewares/multer.middleware.js";

const publishAVideo = asyncHandler(async (req, res)=>{
    //get user details from frontend
    //validation - not empty or user existance
    //get video details from frontend
    //check for thumbnail
    //upload the video to cloudinary
    //create video object - create entry in db
    //validate video upload
    //return response
    
    const {title,description} = req.body

    console.log("Req:", req)
    if([title,description].some((field)=> field?.trim() === "")){
        throw new ApiError(400, "All fields are required")
    }

    const exisedVideo = await Video.findOne({
        $or: [{ title }, { description }]
    })

    if(exisedVideo){
        throw new ApiError(409, "Video title or description  already exists")
    }

    const videoLocalPath = req.files?.videoFile[0]?.path;

    if(!videoLocalPath){
        throw new ApiError(400, "Video file is required")
    }

    let thumbnailLocalPath;
    if(req.files && Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0){
        thumbnailLocalPath = req.files.thumbnail[0].path;
    }

    
    const videoFile = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    const user = await User.findById(req.user?._id)


    if(!videoFile){
        throw new ApiError(400, "Video file is required")
    }
    
    if(!thumbnail){
        throw new ApiError(400, "Thumbnail file is required")
    }

    if(!user){
        throw new ApiError(400,"User not existed")
    }

    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        duration: videoFile.duration,
        owner: user._id
    })

    if(!video){
        throw new ApiError(500, "Something went wrong while uploading the video!!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"Video uploaded successfully!!")
    )

})

// const getAllVideos = asyncHandler(async (req, res)=>{
//     const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
// })

export {publishAVideo}
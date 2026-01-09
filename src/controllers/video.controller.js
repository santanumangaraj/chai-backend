import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";
import { upload } from "../middlewares/multer.middleware.js";
import { application } from "express";

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

const getAllVideos = asyncHandler(async (req, res)=>{
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum-1) * limitNum;


    if(!query){
        throw new ApiError(400, "Query is missing")
    }

    const filter = {};
    if(query){
        filter.$or=[
            {title: {$regex: query,$options: "i"}},
            {description: {$regex: query, $options: "i"}}
        ];
    }

    if(userId){
        filter.owner=userId
    }

    let sortOPtions = {};
    if(sortBy){
        sortOPtions[sortBy] = sortType === "asc"?1:-1;
    }else{
        sortOPtions.createdAt= -1;
    }

    const videos = await Video.find(filter)
    .sort(sortOPtions)
    .skip(skip)
    .limit(limitNum)

    const totalVideos = await Video.countDocuments(filter);

    let message=!videos?.length?"No videos found!!":"Videos loaded successfully";

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                totalVideos,
                currentPage: pageNum,
                totalPages: Math.ceil(totalVideos / limitNum),
                videos
            },
            message
        )
    )
})

const getVideosById = asyncHandler(async (req, res)=>{
    const {videoId} = req.params

    if(!videoId){
        throw new ApiError(400,"video id is missing")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(400,"video not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "Video loaded successfully"
        )
    )
})

const updateVideoDetails = asyncHandler(async (req, res)=>{
    const {title,description} = req.body
    const {videoId} = req.params

    if(!title || !description){
        throw new ApiError(400,"All fields are required")
    }

    if(!videoId){
        throw new ApiError(400,"Video Id is required")
    }

    const video= await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description
            }
        },
        {new: true}
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200, video,"Video details updated successfully")
    )

})

const deleteAVideo = asyncHandler(async (req, res)=>{
    const {videoId} = req.params

    if(!videoId){
        throw new ApiError(400,"Video id is required")
    }

    const video = await Video.findByIdAndDelete(
        videoId,
    )

    if(!video){
        throw new ApiError(400,"Video not exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"Video deleted successfully")
    )

})

const togglePublishStatus = asyncHandler(async (req, res)=>{
    const {videoId} = req.params

    if(!videoId){
        throw new ApiError(400,"Video id is required")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(400,"Error occured while finding the video")
    }

    video.isPublished = !video.isPublished
    await video.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200,video,"Video Published status update successfully")
    )
})
export {
    publishAVideo,
    getAllVideos,
    getVideosById,
    updateVideoDetails,
    deleteAVideo,
    togglePublishStatus
}
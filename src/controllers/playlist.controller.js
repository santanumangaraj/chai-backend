import { Playlist } from "../models/playlist.model.js";
import {Video} from "../models/video.model.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js"

const createPlaylist = asyncHandler(async (req , res)=>{
    const {name,description} = req.body

    if(
        [name,description].some((field)=> field?.trim() === "")
    ){
        throw new ApiError(400,"All fields are required")
    }

    const existPlaylist = await Playlist.findOne(
        {
            name
        }
    )

    if(existPlaylist){
        throw new ApiError(409,"Playlist with name already exists")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner:req.user?._id
    })

    if(!playlist){
        throw new ApiError(500,"Something went wrong while creating the playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "Playlist created successfully"
        )
    )
})

const getUserPlaylist = asyncHandler(async (req, res)=>{
    const {userId} = req.params

    if(!userId){
        throw new ApiError(400,"User id field is required")
    }

    const userPlaylist = await Playlist.find({owner:userId})

    if(!userPlaylist){
        throw new ApiError(404,"user Playlist does not exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,userPlaylist,"user playlist fetched successfully")
    )
})

const getPlaylistById = asyncHandler(async (req, res)=>{
    const {playlistId} = req.params

    if(!playlistId){
        throw new ApiError(400,"playlist id is required")
    }

    const playlistById = await Playlist.findById(playlistId)

    if(!playlistById){
        throw new ApiError(404,"Playlist not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,playlistById,"Playlist fetched successfully")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res)=>{
    const {videoId,playlistId} = req.params

    if(!videoId || !playlistId){
        throw new ApiError(400,"All fields are required")
    }
    
    const video = await Video.findById(videoId)
    
    if(!video){
        throw new ApiError(404,"Video not found")
    }
    
    const addVideo = await Playlist.findOneAndUpdate (
        {_id:playlistId, owner:req.user?._id},
        {
            $addToSet:{
                videos: videoId
            }
        },
        {new: true}
    )
    
    if(!addVideo){
        throw new ApiError(404,"Playlist not found or Playlist can only be modified by owner")
    }
    
    return res
    .status(200)
    .json(
        new ApiResponse(200,addVideo,"Video added to playlist successfully ")
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res)=>{
    const {playlistId, videoId} = req.params
    
    if(!(playlistId || videoId)){
        throw new ApiError(400,"All fields are required")
    }

    const video = await Video.findById(videoId)
    
    if(!video){
        throw new ApiError(404,"Video not found")
    }

    
    const removeVideo = await Playlist.findOneAndUpdate(
        {_id: playlistId, owner:req.user?._id},
        {
            $pull : {videos:videoId}
        },
        {new: true}
    )
    
    if(!removeVideo){
        throw new ApiError(404,"Playlist not found or playlist can only be modified by owner")
    }
    
    return res
    .status(200)
    .json(
        new ApiResponse(200,removeVideo,"Video deleted from playlist successfully")
    )

})

const updatePlaylist = asyncHandler(async (req, res)=>{
    const {playlistId} = req.params
    const {name,description} = req.body
    
    if(!playlistId){
        throw new ApiError(400,"Playlist id is required")
    }

    if(!name && !description){
        throw new ApiError(400,"Any one field is required")
    }
    
    const playlist = await Playlist.findOneAndUpdate(
        {_id: playlistId, owner:req.user?._id},
        {
            $set:{
                name,
                description
            }
        },
        {new: true}
    )
    
    if(!playlist){
        throw new ApiError(404,"Playlist not found or playlist can only be modified by owner")
    }
    
    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"Playlist updated successfully")
    )
})

const deletePlaylist = asyncHandler(async (req, res)=>{
    const {playlistId} = req.params
    
    if(!playlistId){
        throw new ApiError(400,"Playlist id is required")
    }
    
    const playlist = await Playlist.findOneAndDelete(
        {_id: playlistId, owner:req.user?._id}
    )
    
    if(!playlist){
        throw new ApiError(404,"Playlist not found or playlist can only be modified by owner")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,playlist,"Playlist deleted successfully")
    )
})

export {
    createPlaylist,
    getUserPlaylist,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    updatePlaylist,
    deletePlaylist
}
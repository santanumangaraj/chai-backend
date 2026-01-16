import { Playlist } from "../models/playlist.model.js";
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
    console.log(userPlaylist)

    if(!userPlaylist){
        throw new ApiError(400,"user Playlist does not exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,userPlaylist,"user playlist fetched successfully")
    )
})

export {
    createPlaylist,
    getUserPlaylist
}
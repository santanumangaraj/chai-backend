import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const addComment = asyncHandler(async (req, res)=>{
    const {content} = req.body
    const {videoId} = req.params

    if(!(content || videoId)){
        throw new ApiError(400,"All fields are required")
    }

    const comment = await Comment.create(
        {
            owner:req.user?._id,
            video:videoId,
            content:content
        },
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200,comment,"Comment upload successfully")
    )
})

const getVideoComment = asyncHandler(async (req, res)=>{
    const {videoId} = req.params

    if(!videoId){
        throw new ApiError(400,"Video id is required")
    }

    const comments = await Comment.find({video:videoId})
    const totalComments = await Comment.countDocuments({video:videoId})

    return res
    .status(200)
    .json(
        new ApiResponse(200,
            {
                totalComments,
                comments
            }
            ,"Video comments fetched successfully")
    )
})

const updateComment = asyncHandler(async (req, res)=>{
    const {newComment} = req.body
    const {commentId} = req.params

    if (!(newComment || videoId)){
        throw new ApiError(400,"All fields are required")
    }

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content:newComment
            }
        },
        {new:true}
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200,comment,"Comment updated successfully")
    )
})

const deleteComment = asyncHandler(async (req,res)=>{
    const {commentId} = req.params

    if(!commentId){
        throw new ApiError(400,"Comment id is required")
    }

    const comment = await Comment.findByIdAndDelete(commentId)

    let msg;
    if(comment?.length>0){
        msg = "Comment deleted successfully"
    }else{
        msg="Comment not found"
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,comment,msg)
    )
})

export {
    addComment,
    getVideoComment,
    updateComment,
    deleteComment
}
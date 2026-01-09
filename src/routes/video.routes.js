import { Router } from "express";
import { deleteAVideo, getAllVideos, getVideosById, publishAVideo, togglePublishStatus, updateVideoDetails } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
router.use(verifyJWT)

router.route("/").get(getAllVideos)

router.route("/upload-video").post(
    upload.fields([
        {
            name: "videoFile",
            maxCount: 1
        },{
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    publishAVideo
)

router.route("/v/:videoId").get(getVideosById)
router.route("/update-video-details/:videoId").patch(updateVideoDetails)
router.route("/delete-video/:videoId").delete(deleteAVideo)
router.route("/toggle/publish/:videoId").patch(togglePublishStatus)

export default router
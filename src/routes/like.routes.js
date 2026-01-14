import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getLikedVideos, toggleCommentLike, toggleTweetlike, toggleVideoLike } from "../controllers/like.controller.js";


const router = Router()

router.use(verifyJWT)


router.route("/cl/:commentId").post(toggleCommentLike)

router.route("/vl/:videoId").post(toggleVideoLike)

router.route("/tl/:tweetId").post(toggleTweetlike)

router.route("/liked-videos").get(getLikedVideos)

export default router
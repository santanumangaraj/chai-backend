import { Router } from "express";
import { getSubscribedChannel, getUserChannelSubscibers, toggleSubscription } from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
router.use(verifyJWT)

router.route("/c/:channelId")
.post(toggleSubscription)
.get(getUserChannelSubscibers)

router.route("/u/:subscriberId").get(getSubscribedChannel)
export default router
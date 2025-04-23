import { Router } from "express";
import { videoController } from "../controllers/videoController";



// Create a new router
export const videoRounter = Router()

// Define routes
videoRounter.post('/getVideos', videoController);
videoRounter.post('/uploadVideos', videoController);



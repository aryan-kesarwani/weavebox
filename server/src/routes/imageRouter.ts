import { Router } from "express";
import { imageController } from "../controllers/imageController";

// Create a new router
export const imageRounter = Router()

// Define routes
imageRounter.post('/getImage', imageController);
imageRounter.post('/uploadImage', imageController);



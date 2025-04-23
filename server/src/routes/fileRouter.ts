import { Router } from "express";
import { fileController } from "../controllers/fileController";


// Create a new router
export const fileRouter = Router()

// Define routes
fileRouter.post('/getFile', fileController);
fileRouter.post('/uploadFile', fileController);



import { Router } from "express";
import { authRouter } from "./authRoutes";
import { fileRouter } from "./fileRouter";
import { imageRounter } from "./imageRouter";
import { videoRounter } from "./videoRouter";



export const mainRouter = Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/file", fileRouter);    
mainRouter.use("/image", imageRounter);    
mainRouter.use("/video", videoRounter);    



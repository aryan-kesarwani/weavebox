import { Router } from "express";
import createProfile from "../controllers/profileCreation.controller"


// Create a new router
export const userRounter = Router()

// Define routes
userRounter.post('/profile', createProfile);



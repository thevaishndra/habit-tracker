//signup, login, logout, get user profile, update user profile, change password, generateaccessrefreshtoken, refreshACCESStoken

import { asyncHandler } from "../utils/AsyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { User } from "../models/user.model";
import { uploadCloudinary } from "../utils/Cloudinary"; 
import jwt from 'jsonwebtoken';

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findOne(userId);
        const accessToken = generateAccessToken();
        const refreshToken = generateRefreshToken();

        user.refreshToken = refreshToken;

        //we are saving the user in database and it's not checking validateBeforeSave as it is false
        await user.save({validateBeforeSave : false});
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError (
            500, "Something went wrong while generating refresh and access token"
        )
    }
}

const signupUser = asyncHandler(async(req, res) => {
    //get user details
    const { fullName, email, password, username } = req.body;

    //validate user
    if(
        [fullName, email, password, username].some((field) => field?.trim() === "")
    ){//trim removes all the whitespaces then we check the field is not null or undefined
        throw new ApiError(400, "All fields are required")
    }

    //check if user already exists
    
    //check for profilepic
    //uploadthem to cloudinary
    //make entry of user in database
    //remove password and refresh token
    //check for user creation
    //return response
})
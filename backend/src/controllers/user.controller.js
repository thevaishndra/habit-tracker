//login, logout, get user profile, update user profile, change password, refreshACCESStoken

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
        [fullName, email, password, username].some((field) => !field || field.trim() === "")
    ){//trim removes all the whitespaces then we check the field is not null or undefined
        throw new ApiError(400, "All fields are required")
    }

    //validate password strength
    if(password.length < 8){
        throw new ApiError(400, "Password must be atleast 8 characters long")
    }

    //check if user already exists
    const existedUser = await User.findOne({
        $or : [{username}, {email},]//search from either username or email
    });
    if(existedUser){
        throw new ApiError(409, "User with this email or username already exists")
    }

    //check for profilepic
    const profilePicLocalPath = req.files?.profilePic[0]?.path;

    if(!profilePicLocalPath){
        throw new ApiError(400, "Profile pic is missing or not uploaded")
    }

    const allowedFileTypes = ["image/jpeg", "image/png"];
    const profilePicMimeType = req.files?.profilePic?.[0]?.mimetype;//storing the mime type

    if(!allowedFileTypes.includes(profilePicMimeType)){//if it's not the required file type
        throw new ApiError(400, "Invalid profile pic format. Only JPEG and PNG is allowed")
    }

    //upload them to cloudinary
    const profilePic = await uploadCloudinary(profilePicLocalPath);
    if(!profilePic){
        throw new ApiError(400, "Failed to upload profile pic to cloudinary")
    }

    //make entry of user in database
    const user = await User.create({
        fullName,
        profilePic : profilePic.url,
        email,
        password,
        username : username.toLowerCase(),
    })

    //remove password and refresh token
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )//to remove sensitive info from exposing

    //check for user creation
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while signingup");
    }

    //return response
    return resStatus(201).json(
        new ApiResponse(201, createdUser, "User signedup successfully")
    )
})
// Validation errors: 400 Bad Request
// Resource conflict: 409 Conflict
// Internal server errors: 500 Internal Server Error
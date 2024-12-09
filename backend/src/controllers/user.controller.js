import { asyncHandler } from "../utils/AsyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { User } from "../models/user.model";
import { uploadCloudinary } from "../utils/Cloudinary"; 
import jwt from 'jsonwebtoken';

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
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
    return res
    .status(201).json(
        new ApiResponse(201, createdUser, "User signedup successfully")
    )
})

const loginUser = asyncHandler(async(req, res) => {
    //req body
    const {email, password, username} = req.body

    //username or email
    if(!(username || email)){
        throw new ApiError(400, "Username or email is required");
    }

    //find the user
    const user = await User.findOne({
        $or : [{username}, {email}],
    });
    if(!user){
        throw new ApiError(404, "User does not exist");
    }

    //password check
    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new ApiError(401, "Password is incorrect")
    }

    //access and refresh token
    const {accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id);

    //remove password and refresh token
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    //send cookie
    const options = {
        httpOnly : true,
        secure : true,
        sameSite : 'Strict',

    }
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200, {
            user: loggedInUser, accessToken, refreshToken
        }, "User logged in successfully")
    )
})

const logoutUser = asyncHandler(async(req, res) => {
    //finding userid and deleting refresh token of that id, returning updated doc after change is applied
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken : undefined
            }
        },
        {
            new : true
        }
    )

    const options = {
      httpOnly: true, //prevents client side js from accessing the cookie, improving security
      secure: true, //ensure cookie is sent only over https
      sameSite: "Strict",
    };
    return res
    .status(200)
    .cookie("accessToken", "", options)
    .cookie("refreshToken", "", options)
    .json(
        new ApiResponse(200, {}, "User logged out")
    )
})

const refreshAccessToken = asyncHandler(async(req, res) => {
    //retrieving refresh token from 2 sources
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401, "unauthorized request")
    }

    try {
        //verify refresh token by using secret key
        const decodedToken = jwt.verify(
          incomingRefreshToken,
          process.env.REFRESH_TOKEN_SECRET,
        );

        //fetching user from id obtained from decoded token
        const user = await User.findById(decodedToken?._id)

        //validating user and refresh token
        if(!user){
            throw new ApiError(401, "Invalid refresh token")
        }
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used")
        }

        //generate new tokens and saving in database
        const {accessToken, newRefreshToken} = await generateAccessTokenAndRefreshToken(user._id)
        user.refreshToken = newRefreshToken;
        await user.save();

        //cookies
        const options = {
          httpOnly: true,
          secure: true,
          sameSite: "Strict",
        };

        //response
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("newRefreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(200, {
                accessToken, refreshToken : newRefreshToken,
            }, "Access token refreshed")
        )
    } catch (error) {
        console.error("Refresh Token Error: ", error);
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const getUserProfile = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})

const updateUserProfile = asyncHandler(async(req, res) => {
    //fetching details that will be updated
    const {fullName, email, profilePic} = req.body

    //validating fetched fields
    if(!fullName || !email){
        throw new ApiError(400, "Fullname and email fields are required")
    }

    //updating user's profile
    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                fullName,
                email,
                ...(profilePic && {profilePic}),//only update profilePic if it's provided
            }
        },
        {new : true}
    ).select('-password -refreshToken')

    //response
    return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "User profile updated successfully"))
})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    //fetching password
    const {oldPassword, newPassword} = req.body
    
    //fetching user
    const user = await User.findById(req.user?._id)

    //validating password
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old password")
    }

    //updating password
    user.password = newPassword;
    await user.save({validateBeforeSave : false})//skips validation of this type as it is not needed

    //response
    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

export {
  generateAccessTokenAndRefreshToken,
  signupUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getUserProfile,
  updateUserProfile,
  changeCurrentPassword,
};
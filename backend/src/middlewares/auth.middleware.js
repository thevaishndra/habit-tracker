import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/AsyncHandler.js'
import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js'

//function checks if user has valid token or not
const verifyJWT = asyncHandler(async(req, _, next) => {//res isn't used here, so we use _
    try {
        //server checks if user has a token - it looks token in 2 places cookies and header
        //the header has a word bearer and the token, we need only the token, so it splits after bearer and space in array
        const token = req.cookies?.accessToken || req.header("Authorization")?.split(" ")[1];

        //if no token is found it throws error
        if(!token){
            throw new ApiError(401, "Unauthorized request")
        }

        //checks if the token is valid using a secret key
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        //it searches for user in database using id, extracted from decodedToken, it excludes password and refreshToken
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        //if user is not found, it throws error
        if(!user){
            throw new ApiError(401, "Invalid access token");
        }

        //if user is found, their info is attached to request
        //this allows other parts of application to access user details
        req.user = user;
        next();
    } catch (error) {//if anyrhing fails the request is blocked
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})
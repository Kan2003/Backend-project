import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { uploadImage } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from 'jsonwebtoken';

const genrateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
     
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});

        return {accessToken, refreshToken};
    } catch (error) {
        throw new ApiError(500 , 'Internal Server Error while genrating tokens');
    }
}

const ragisterUser = asyncHandler( async(req , res) => {
     // get user details  from frontend
     // validation - not empty 
     // check if email already exists
     // check for image , check for avatar
     // upload them to cloudinary , avatar
     // create entry in db
     // remove pass & refresh token field from response
     // check for user creation
     // return res 

    //console.log('body' , req.body)
    const {fullname , email , username , password} = req.body;
    if(
        [fullname , email , username , password].some(field => field?.trim() === '')
    ){
        throw new ApiError(400 , 'All fields are required');
    }

    const existedUser = await User.findOne({
        $or: [{username},{email}]
    })

    if(existedUser){
        throw new ApiError(409 , 'User already exists');
    }

    //console.log('files', req.files)

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0 ){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath){
        throw new ApiError(400 , 'Avatar is required');
    }

    const avatar = await uploadImage(avatarLocalPath)

    const coverImage = await uploadImage(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400 , 'Avatar is required');
    }

    const user = await User.create({
        fullname,
        email,
        username : username.toLowerCase(),
        password,
        avatar : avatar.url,
        coverImage : coverImage?.url || '',
    })

    const createdUser = await User.findById(user._id).select(
        '-password -refreshToken'
    )

    if(!createdUser){
        throw new ApiError(500 , 'Failed to create user');
    }

     return res.status(201).json(
        new ApiResponse(201, 'User created successfully', createdUser)
     );
})                                


const loginUser = asyncHandler( async(req , res) => {                           
    //check email and username exists
    //check password
    //find the user
    // pass check
    // access token & refresh token generation
    // send cookie

    console.log(req.body)
    const {email , username , password} = req.body;
    console.log(username , email , password);

    if(!(username || email )){
        throw new ApiError(400 , 'Email or username is required');
    }

    const user = await User.findOne({
        $or : [{username} , {email}]
    })

    if(!user){
        throw new ApiError(404 , 'user does not exist');
    }

    const isValid = await user.isPasswordCorrect(password);

    if(!isValid){
        throw new ApiError(401 , 'invalid credentials');
    }

    const {accessToken , refreshToken} = await genrateAccessAndRefreshTokens(user._id)

    const loggedInuser = await User.findById(user._id).select('-password -refreshToken')

    const options = {
        httpOnly : true,
        secure : true
    }

    return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
        new ApiResponse(200,
        {
            user: loggedInuser , accessToken , refreshToken
        },
        'user logged in successfully'
        )
     );
    
})


const logoutUser = asyncHandler( async(req , res) => {
    // remove accesstoken & refreshtoken from cookies
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }
    return res
    .status(200)
    .clearCookie('accessToken',options)
    .clearCookie('refreshToken',options)
    .json(new ApiResponse(
        200,
        'User loggout successfully'
    ))

})

const refreshAccessToken = asyncHandler(async(req , res) => {
   const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken

   if(!incomingRefreshToken){
    throw new ApiError(401 , 'No refresh token provided')
   }

   try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
 
    const user = await User.findById(decodedToken._id)
 
    if(!user){
     throw new ApiError(401 , 'invalid refresh token')
    }
 
    if(user.refreshToken !== incomingRefreshToken){
     throw new ApiError(401 , 'refresh is expired or used')
    }
 
    const options = {
     httpOnly : true,
     secure : true
    }
 
    const {accessToken , newRefreshToken} = await genrateAccessAndRefreshTokens(user._id)
 
    return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', newRefreshToken, options)
    .json(
     new ApiResponse(
         200,
         {
             user: user , accessToken , newRefreshToken
         },
         'User refreshed successfully'
     ))
   } catch (error) {
        throw new ApiError(401 , error?.message || 'Invalid refresh token')
   }
})

export { ragisterUser , loginUser , logoutUser , refreshAccessToken };
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { uploadImage } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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


export { ragisterUser };
const asyncHandler=require('../utils/asyncHandler')
const ApiError=require('../utils/ApiError')
const ApiResponse=require('../utils/ApiResponse')
const User=require('../models/user.model')

const generateRefreshAndAccessToken=async(_id)=>{
    try {
        const user=await User.findById(_id)
        if(!user) throw new ApiError(400,"User not found in database")

        const accessToken=await user.generateAccessToken()
        const refreshToken=await user.generateRefreshToken()
    
        user.refreshToken=refreshToken
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}
    } catch (error) {
        console.log(error);
    }
}

const login=asyncHandler(async (req,res) => {
    
})

const register=asyncHandler(async (req,res) => {
    const {
        username,email,fullname,profilePhoto,coverPhoto,password,dob,location
    }=req.body

    if(!username || !fullname || !email || !password || !dob || !location) throw new ApiError(400,"please provide all details")
    const isExists=await User.find({$or:[{username:username,email:email}]}) 
    if(!isExists) throw new ApiError(400,"user already exists .please login")

    const user=await User.create({
        username:username.toLowerCase(),
        email:email.toLowerCase(),
        fullname:fullname,
        password:password,
        dob:dob,
        location:location
    })
    if(!user) throw new ApiError(400,"user creation failed")

    const {refreshToken,accessToken}=await generateRefreshAndAccessToken(user._id)

    const newUser=User.findById(user._id).select("-password -refreshToken -accessToken")
    if(!newUser) throw new ApiError(400,"new user creation failed")

    const options={
        httpOnly:true,
        secure:true
    }

    //photo baki che
    res
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(201,{accessToken,refreshToken,user},"user registered successfully")
    )

})

module.exports={login,register};

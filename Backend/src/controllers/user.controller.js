const asyncHandler=require('../utils/asyncHandler')
const ApiError=require('../utils/ApiError')
const ApiResponse=require('../utils/ApiResponse')
const User=require('../models/user.model')
const uploadOnCloudinary=require('../utils/cloudinary')
const jwt=require('jsonwebtoken')

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
    const {
        username,email,password
    }=req.body
    if(!username && !email) throw new ApiError(400,"please provide all details")
    if(!password) throw new ApiError(400,"please provide all details")

    const user=await User.findOne({$or:[{username},{email}]}) 
    if(!user) throw new ApiError(400,"no user found,please register")
    
    const isPassCorr=await user.comparePassword(password);    
    if(!isPassCorr) throw new ApiError(400,"incorrect password")
        
    const {accessToken,refreshToken}=await generateRefreshAndAccessToken(user._id)

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
        new ApiResponse(201,{accessToken,refreshToken,user},"user loggedin successfully")
    )

})

const register=asyncHandler(async (req,res) => {
    const {
        username,email,fullname,password,dob,location
    }=req.body

    if(!username || !fullname || !email || !password || !dob || !location) throw new ApiError(400,"please provide all details")
    const isExists=await User.findOne({$or:[{username},{email}]}) 
    if(isExists) throw new ApiError(400,"user already exists .please login")

    const user=await User.create({
        username:username.toLowerCase(),
        email:email.toLowerCase(),
        fullname:fullname,
        password:password,
        dob:dob,
        location:location,
        skillsOffered:[],
        skillsWanted:[],
    })
    if(!user) throw new ApiError(400,"user creation failed")

    const {accessToken,refreshToken}=await generateRefreshAndAccessToken(user._id)

    
    if (!req.files) throw new ApiError(400, "No file uploaded");

    const profilePhoto = req.files['profilePhoto']?.[0];
    const coverPhoto = req.files['coverPhoto']?.[0];
    
    const profile = await uploadOnCloudinary(profilePhoto.path);
    const cover = await uploadOnCloudinary(coverPhoto.path);

    
    if (!profile && !cover) throw new ApiError(500, "Cloudinary upload failed");
    if (!profile ) throw new ApiError(500, "profile upload failed");
    if (!cover) throw new ApiError(500, "cover upload failed");
    
    user.profilePhoto=profile
    user.coverPhoto=cover

    await user.save({validateBeforeSave:false})

    const newUser=User.findById(user._id).select("-password -refreshToken -accessToken")
    if(!newUser) throw new ApiError(400,"new user creation failed")

    const options={
        httpOnly:true,
        secure:true
    }

    res
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(201,{accessToken,refreshToken,user},"user registered successfully")
    )

})

const logout=asyncHandler(async(req,res)=>{

    await User.findByIdAndUpdate(req.user._id,
        {$set:{refreshToken:"1"}}
    )

    const options={
        httpOnly:true,
        secure:true
    }

    res
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(201,{},"logout successfull")
    )
})

const refreshToken=asyncHandler(async(req,res)=>{
    const token=req.cookies?.refreshToken
    if(!token) throw new ApiError(401,"no refresh Token Found")

    const decoded=jwt.verify(token,process.env.REFRESH_TOKEN_SECRET_KEY)
    if(!decoded) throw new ApiError(403,"token not verified")
            
    const _id=decoded._id
    const user=await User.findById(_id)
    if(user.refreshToken!=token) throw new ApiError(402,"token mismatch")

    const {accessToken,refreshToken}=await generateRefreshAndAccessToken(_id)
    user.refreshToken=refreshToken
    user.save({validateBeforeSave:false})
    
    const options={
        httpOnly:true,
        secure:true
    }

    res
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(201,{},"token refreshed successfully")
    )
})

const addSkillOffered=asyncHandler(async(req,res)=>{
    const {_id}=req.user
    const {skill}=req.body
    if(!skill) throw new ApiError(402,"please add skill")
    
    const user=await User.findByIdAndUpdate(_id,{
        $push:{
            skillsOffered:skill
        },
    },
        {new:true}
    )
    res.json(
        new ApiResponse(201,user.skillsOffered,"added skills")
    )
})


const addSkillWanted=asyncHandler(async(req,res)=>{
    const {_id}=req.user
    const {skill}=req.body
    if(!skill) throw new ApiError(402,"please add skill")
    
    const user=await User.findByIdAndUpdate(_id,{
        $push:{
            skillsWanted:skill
        },
    },
        {new:true}
    )
    res.json(
        new ApiResponse(201,user.skillsWanted,"added skills")
    )
})

const removeSkillOffered=asyncHandler(async(req,res)=>{
    const {_id}=req.user
    const skill = req.body.skill.toLowerCase().trim();
    if(!skill) throw new ApiError(402,"please add skill")

    const user=await User.findByIdAndUpdate(_id,{
        $pull:{
            skillsOffered:skill
        },
    },
        {new:true}
    )
    res.json(
        new ApiResponse(201,user.skillsOffered,"added skills")
    )
})


const removeSkillWanted=asyncHandler(async(req,res)=>{
    const {_id}=req.user
    const skill = req.body.skill.toLowerCase().trim();
    if(!skill) throw new ApiError(402,"please add skill")  
    
    const user=await User.findByIdAndUpdate(_id,{
        $pull:{
            skillsWanted:skill
        },
    },
        {new:true}
    )
    res.json(
        new ApiResponse(201,user.skillsWanted,"added skills")
    )
})

module.exports={
    login,
    register,
    logout,
    refreshToken,
    addSkillOffered,
    addSkillWanted,
    removeSkillOffered,
    removeSkillWanted
};

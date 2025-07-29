const User=require('../models/user.model')
const ApiError = require('../utils/ApiError')
const asyncHandler = require('../utils/asyncHandler')

const isAdmin=asyncHandler(async(req,res,next)=>{
    const {_id}=req.user
    const user=await User.findById(_id)
    if(!user) throw new ApiError(401,"no user found")

    if(!user.isAdmin) throw new ApiError(403,"access denied,not an admin")
    next()
})

module.exports=isAdmin
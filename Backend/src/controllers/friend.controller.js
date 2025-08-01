const Friend = require('../models/friend.model')
const User = require('../models/user.model')
const ApiError = require('../utils/ApiError')
const ApiResponse = require('../utils/ApiResponse')
const asyncHandler = require('../utils/asyncHandler')

const requestFriend=asyncHandler(async(req,res)=>{
    const {userId}=req.params
    const {_id}=req.user

    if(userId==_id) throw new ApiError(402,"requester and sender id cant be same")

    const toUser=await User.findById(userId)
    if(!toUser) throw new ApiError(402,"no such user found")

    const fromUser=await User.findById(_id)
    if(!fromUser) throw new ApiError(402,"no such user found")

    const friendRequest=await Friend.create({
        from:_id,
        to:userId
    })

    res.json(
        new ApiResponse(201,friendRequest,"request send successfully")
    )
})

const acceptRequest=asyncHandler(async(req,res)=>{
    const {userId}=req.params
    const {_id}=req.user

    const fromExists=await User.findById(userId)
    if(!fromExists) throw new ApiError(403,"no such user")

    const toExists=await User.findById(_id)
    if(!toExists) throw new ApiError(403,"no such user")

    const request=await Friend.findOne({
        from:userId,
        to:_id
    })
    if(!request) throw new ApiError(403,"no such request found")

    request.pending=false
    request.save({validateBeforeSave:false})

    res.json(
        new ApiResponse(200,"request accepted")
    )
})

const rejectRequest=asyncHandler(async(req,res)=>{
    const {userId}=req.params
    const {_id}=req.user

    const fromExists=await User.findById(userId)
    if(!fromExists) throw new ApiError(403,"no such user")

    const toExists=await User.findById(_id)
    if(!toExists) throw new ApiError(403,"no such user")

    const deletedReq=await Friend.findOneAndDelete({
        from:userId,
        to:_id
    })
    if(!deletedReq) throw new ApiError(403,"request rejection failed")

    res.json(
        new ApiResponse(200,"request rejected")
    )
})

module.exports={
    requestFriend,
    acceptRequest,
    rejectRequest
}
const { default: mongoose } = require('mongoose')
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
        new ApiResponse(200,[],"request accepted")
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
        new ApiResponse(200,{},"request rejected")
    )
})

const getAllPendingRequests=asyncHandler(async(req,res)=>{
    const _id=new mongoose.Types.ObjectId(req.user._id)
    const user=await User.findById(_id)

    if(!user) throw new ApiError(403,"no such user")

    const requests=await Friend.aggregate([
        {
            $match : {to: _id}
        },
        {
            $match:{pending:false}
        },
        {
            $project:{
                from:1
            }
        }
    ])
    
    const count=requests.length
    res.json(
        new ApiResponse(200,{requests,count:count},"pending requests")
    )
})

const getAllFollowers=asyncHandler(async(req,res)=>{
    const _id=new mongoose.Types.ObjectId(req.user._id)
    const user=await User.findById(_id)

    if(!user) throw new ApiError(403,"no such user")

    const followers=await Friend.aggregate([
        {
            $match : {to: _id}
        },
        {
            $match:{pending:true}
        },
        {
            $project:{
                from:1
            }
        }
    ])
    
    const count=followers.length
    res.json(
        new ApiResponse(200,{followers,count:count},"followers list")
    )
})

const getAllFollowing=asyncHandler(async(req,res)=>{
const _id=new mongoose.Types.ObjectId(req.user._id)
    const user=await User.findById(_id)

    if(!user) throw new ApiError(403,"no such user")

    const following=await Friend.aggregate([
        {
            $match : {from: _id}
        },
        {
            $match:{pending:true}
        },
        {
            $project:{
                to:1
            }
        }
    ])
    
    const count=following.length
    res.json(
        new ApiResponse(200,{following,count:count},"following list")
    )
})

module.exports={
    requestFriend,
    acceptRequest,
    rejectRequest,
    getAllPendingRequests,
    getAllFollowers,
    getAllFollowing
}
const mongoose=require('mongoose')

const friendSchema=mongoose.Schema({
    from:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    to:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    pending:{
        type:Boolean,
        default:true
    }
})

module.exports=mongoose.model("Friend",friendSchema)
const mongoose=require('mongoose')

const userSchema=mongoose.Schema({

    username:{
        type:String,
        trim:true,
        unique:true,
        lowercase:true,
        required:true
    },
    fullname:{
        type:String,
        trim:true,
        required:true
    },
    email:{
        type:String,
        trim:true,
        lowercase:true,
        required:true,
        

        
    }

},{timeStamps:true})
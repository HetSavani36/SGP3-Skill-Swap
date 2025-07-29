const mongoose=require('mongoose')
const validator = require('validator')

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
        unique:true,
        validate:[validator.isEmail,"Invalid email format"]
    },
    password:{
        type:String,
        required:true
    },
    profilePhoto:{
        type:String,  //cloudinary url
        default:"https://i.ibb.co/2kRrzBJ/default-profile.png"
    },
    coverPhoto:{
        type:String,  //cloudinary url
        default:"https://i.ibb.co/2kRrzBJ/default-profile.png"
    },
    dob:{
        type:Date,
        required:true,
        validate:{
            validator: function (value) {
                return value <= new Date();
            },
            message: "DOB cannot be in the future.",
        }
    },
    age:{
        type:Number,
        default:0
    },
    location:{
        type:String,
        trim:true
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    refreshToken:{
        type:String,
    }
},{timeStamps:true})

userSchema.pre("save",async function (next) {
    try {
        const today = new Date();
        this.age = today.getFullYear() - this.dob.getFullYear();
        if (
            today.getMonth() < this.dob.getMonth() ||
            (today.getMonth() === this.dob.getMonth() &&
            today.getDate() < this.dob.getDate())
        ) {
            this.age--;
        }
        next()
    } catch (error) {
        next(error)
    }
})

module.exports=mongoose.model("User",userSchema)
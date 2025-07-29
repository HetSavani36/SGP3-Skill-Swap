const mongoose=require('mongoose')
const validator = require('validator')
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')

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
        this.password=await bcrypt.hash(this.password,Number(process.env.HASH_SALT_ROUNDS))
        next()
    } catch (error) {
        next(error)
    }
})

userSchema.methods.generateAccessToken=function () {
    return jwt.sign(
        {
            _id:this._id,
            username:this.username,
            email:this.email
        },
        process.env.ACCESS_TOKEN_SECRET_KEY,
        {expiresIn:process.env.ACCESS_TOKEN_EXPIRY}
    )
}
userSchema.methods.generateRefreshToken=function () {
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET_KEY,
        {expiresIn:process.env.REFRESH_TOKEN_EXPIRY}
    )
}

module.exports=mongoose.model("User",userSchema)
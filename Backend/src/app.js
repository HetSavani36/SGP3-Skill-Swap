const express=require('express')
const app=express()
const cors=require('cors')
const cookieParser=require('cookie-parser')
require('dotenv').config({path:'./.env',debug:true})

const userRoutes=require('./routes/user.route')
const friendRoutes=require('./routes/friend.route')

app.use(express.json({limit:"20kb"}))
app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
app.use(express.urlencoded({extended:true,limit:"20kb"}))   
app.use(express.static('public'))
app.use(cookieParser())


app.use("/api/user",userRoutes)
app.use("/api/user",friendRoutes)


app.use('/',(req,res)=>{
    console.log('error 404 page not found');  
})

//image change
//profile change
//password change

module.exports=app
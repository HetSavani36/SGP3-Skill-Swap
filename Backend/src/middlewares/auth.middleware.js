const jwt=require('jsonwebtoken')
const ApiError = require('../utils/ApiError')

const verifyJWT=(req,res,next)=>{
    try {
        
        const header = req.get("authorization") || " ";
        if(!header) throw new ApiError(401,"no header found")
    
        const bearerToken=header.startsWith("Bearer ")?header.split(" ")[1]:null
        const tokenFromCookie=req.cookies?.accessToken
        const token=tokenFromCookie || bearerToken
        
        if(!token) throw new ApiError(401,"no token found")
    
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET_KEY)
        if(!decodedToken) throw new ApiError(403,"Invalid token")
    
        req.user=decodedToken
        next()
    } catch (error) {
        if (error.name === "TokenExpiredError") throw new ApiError(401, "Access token expired")
        else if (error.name === "JsonWebTokenError") throw new ApiError(401, "Invalid access token");
        else throw new ApiError(500, "Internal server error during token verification");
    }
}

module.exports=verifyJWT

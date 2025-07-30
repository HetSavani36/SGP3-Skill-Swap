const mongoose=require('mongoose')

const connectDB=async()=>{
    try {
        mongoose.connect(process.env.MONGO_URL)
    } catch (error) {
        console.log(error+' error while connecting db');
        process.exit(1)
    }
}

module.exports=connectDB
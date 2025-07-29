const express=require('express')
const router=express.Router()
const verifyJWT = require('../middlewares/auth.middleware')

const {
    login,
    register,
    logout
}=require('../controllers/user.controller')
const upload = require('../middlewares/multer.middleware')

router.post('/login',login)
router.post('/register',
    upload.fields([
        {name:"profilePhoto",maxCount:1},
        {name:"coverPhoto",maxCount:1}
    ]),
    register
)
router.post('/logout',verifyJWT,logout)

module.exports=router
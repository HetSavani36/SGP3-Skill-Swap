const express=require('express')
const router=express.Router()
const verifyJWT = require('../middlewares/auth.middleware')

const {
    login,
    register,
    logout
}=require('../controllers/user.controller')

router.post('/login',login)
router.post('/register',register)
router.post('/logout',verifyJWT,logout)

module.exports=router
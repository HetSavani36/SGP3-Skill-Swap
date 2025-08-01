const express=require('express')
const router=express.Router()
const verifyJWT = require('../middlewares/auth.middleware')

const {
    login,
    register,
    logout,
    refreshToken,
    addSkillOffered,
    addSkillWanted,
    removeSkillOffered,
    removeSkillWanted,
    toggleAvailability,
    toggleStatus
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
router.post('/refreshToken',refreshToken)

router.post('/skill/offered/add',verifyJWT,addSkillOffered)
router.post('/skill/wanted/add',verifyJWT,addSkillWanted)

router.post('/skill/offered/remove',verifyJWT,removeSkillOffered)
router.post('/skill/wanted/remove',verifyJWT,removeSkillWanted)

router.post('/toggle/availability',verifyJWT,toggleAvailability)
router.post('/toggle/status',verifyJWT,toggleStatus)

module.exports=router
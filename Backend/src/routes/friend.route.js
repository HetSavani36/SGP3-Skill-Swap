const express=require('express')
const router=express.Router()
const verifyJWT = require('../middlewares/auth.middleware')

const {
    requestFriend,
    acceptRequest,
    rejectRequest
}=require('../controllers/friend.controller')

router.post('/request/:userId',verifyJWT,requestFriend)
router.post('/request/accept/:userId',verifyJWT,acceptRequest)
router.post('/request/reject/:userId',verifyJWT,rejectRequest)

module.exports=router
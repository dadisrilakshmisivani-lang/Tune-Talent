const express = require("express")
const router = express.Router()
const {getprofile,getuserprofile,updateprofile,getallusers} = require("../controllers/profilecontroller.js")
const auth = require("../middlewares/auth.js")
const upload = require("../middlewares/upload.js")

router.get("/all",getallusers)
router.get("/me",auth,getprofile)
router.get("/:id",getuserprofile)
router.put("/update",auth,upload.single('profileimage'),updateprofile)

module.exports = router
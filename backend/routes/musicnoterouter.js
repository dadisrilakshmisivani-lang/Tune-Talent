const express = require("express")
const router = express.Router()
const {uploadnote,getmynotes,getallnotes,getnotebyid,ratenote,bidonnote,getnotebids,deletenote} = require("../controllers/musicnotecontroller.js")
const auth = require("../middlewares/auth.js")
const upload = require("../middlewares/upload.js")

router.post("/upload",auth,upload.single('file'),uploadnote)
router.get("/my",auth,getmynotes)
router.get("/all",getallnotes)
router.get("/:noteid",getnotebyid)
router.post("/:noteid/rate",auth,ratenote)
router.post("/:noteid/bid",auth,bidonnote)
router.get("/:noteid/bids",auth,getnotebids)
router.delete("/:noteid",auth,deletenote)

module.exports = router

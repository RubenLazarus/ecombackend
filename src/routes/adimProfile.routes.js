const express=require("express");
const authenticate = require("../middleware/authenticat.js");
const router=express.Router();
const adminProfileController=require("../controllers/adminProfile.controller.js")

router.post("/",authenticate,adminProfileController.createAdminProfile);
router.get("/",authenticate,adminProfileController.getAdminProfile);

module.exports=router;
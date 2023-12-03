const express=require("express");
const authenticate = require("../middleware/authenticat.js");
const router=express.Router();
const adminUserController=require("../controllers/adminUser.controller.js")

router.get("/getAllUsersByRole",authenticate,adminUserController.getAllUsersByRole);
module.exports=router;
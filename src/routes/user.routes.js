const express=require("express");

const router=express.Router();
const userController=require("../controllers/user.controller.js")

router.get("/",userController.getAllUsers)
router.get("/profile",userController.getUserProfile)
router.post("/addAddress",userController.addAddress)
router.post("/updateAddress",userController.updateAddress)
router.post("/deleteAddress",userController.deleteAddress)
router.put("/updateProfile",userController.updateProfile)

module.exports=router;
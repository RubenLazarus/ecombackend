const express=require("express");

const router=express.Router();
const authController=require("../controllers/auth.controller.js")
const multer = require("multer") 
const upload = multer({ dest: 'uploads/' });

router.post("/signup",authController.register)
router.post("/changeUserPassword",authController.changeUserPassword)
router.post("/signin",authController.login)
router.post("/forgetPassword",authController.forgotPassword)
router.post("/verifyAndChangePassword",authController.verifyAndChangePassword)
router.post("/uploadFiles",upload.single('file'),authController.uploadFiles)

module.exports=router;
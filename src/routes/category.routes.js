const express=require("express");
const router=express.Router();
const categoryController=require("../controllers/category.controller.js")


router.post("/createCategory",categoryController.createCategory)
router.get("/getAllCategory",categoryController.getAllCategory)

module.exports=router;
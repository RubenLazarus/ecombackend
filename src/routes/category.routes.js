const express=require("express");
const router=express.Router();
const categoryController=require("../controllers/category.controller.js")


router.post("/createCategory",categoryController.createCategory)
router.get("/getAllCategory",categoryController.getAllCategory)
router.post("/deleteCategory",categoryController.deleteCategory)
router.post("/updateCategory",categoryController.updateCategory)

module.exports=router;
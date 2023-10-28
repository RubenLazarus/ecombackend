const express=require("express");
const router=express.Router();
const DashboardController=require("../controllers/dashboard.controller")


router.post("/createDashboard",DashboardController.createDashboard)
router.get("/getDashboard",DashboardController.getDashboard)
router.post("/deleteDashboard",DashboardController.deleteDashboard)
router.post("/updateDashboard",DashboardController.updateDashboard)

module.exports=router;
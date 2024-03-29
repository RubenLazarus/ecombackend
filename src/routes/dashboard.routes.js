const express=require("express");
const router=express.Router();
const DashboardController=require("../controllers/dashboard.controller")


router.post("/createDashboard",DashboardController.createDashboard)
router.get("/getDashboard",DashboardController.getDashboard)
router.post("/deleteDashboard",DashboardController.deleteDashboard)
router.post("/updateDashboard",DashboardController.updateDashboard)
router.get("/dashboardData",DashboardController.dashboardData)
router.get("/isActiveDashboard",DashboardController.isActiveDashboard)
router.get("/getAdminDashboardData",DashboardController.adminDashboardData)

module.exports=router;
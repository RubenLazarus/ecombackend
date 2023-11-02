const express=require("express");
const DashboardService=require("../services/dashboard.service");

async function createDashboard(req,res){

    try {
        const dashboard=await DashboardService.createDashboard(req.body);

        return res.status(200).send({dashboard})

    } catch (error) {
        return res.status(500).send({error:error.message})
    }
}
async function getDashboard(req,res){

    try {
        const dashboard=await DashboardService.getDashboard(req.query);

        return res.status(200).send({dashboard})

    } catch (error) {
        return res.status(500).send({error:error.message})
    }
}
async function deleteDashboard(req,res){

    try {
        const dashboard=await DashboardService.deleteDashboard(req.body);

        return res.status(200).send({dashboard})

    } catch (error) {
        return res.status(500).send({error:error.message})
    }
}
async function updateDashboard(req,res){

    try {
        const dashboard=await DashboardService.updateDashboard(req.body);

        return res.status(200).send({dashboard})

    } catch (error) {
        return res.status(500).send({error:error.message})
    }
}
async function dashboardData(req,res){

    try {
        const dashboard=await DashboardService.dashboardData();

        return res.status(200).send({dashboard})

    } catch (error) {
        return res.status(500).send({error:error.message})
    }
}
module.exports={createDashboard,getDashboard,deleteDashboard,updateDashboard,dashboardData};
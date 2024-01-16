const { serve } = require("swagger-ui-express");
const Dashboard = require("../models/dashboard.model");
const Carousel = require("../models/carousel.model");
const Category = require("../models/category.model");
const Product = require("../models/product.model");
const User = require("../models/user.model");
const Order = require("../models/order.model");



// Create a new cart for a user
async function createDashboard(dashboard) {
    let search=[]
    if (dashboard?.name) {
        search.push({ path: dashboard.name })
    }
    const dashboardExist = await Dashboard.findOne({ $and: search })
    if (dashboardExist) {
        return {
            success: false,
            message: "Carousel Already Exist"
        }
    }
    const Dashboards = await new Dashboard({name:dashboard?.name,carousels:dashboard.carousels,categoryIds:dashboard.categoryIds});
    const createdDashboards = await Dashboards.save();
    return {
        success:true,
        message:"Dashboard created successfuly",
        createdDashboards
    };
}
async function getDashboard(query) {
    let search = [{isDeleted:false}]
    var pageNumber = 1;
    var pageSize = 0;
    if (query?.pageNumber && Number(query.pageNumber)) {
      pageNumber = Number(query.pageNumber);
    }
    if (query?.pageSize && Number(query.pageSize)) {
      pageSize = Number(query.pageSize);
    }
    const DashboardCount = await Dashboard
    .find({ $and: search })
    .countDocuments();
  var numberOfPages = pageSize === 0 ? 1 : Math.ceil(DashboardCount / pageSize);
  const Dashboardllist =await Dashboard.aggregate([
    { $match: { $and: search } },
    { $sort: { createdAt: -1 } },
    { $skip: (pageNumber - 1) * pageSize },
    { $limit: pageSize ? pageSize : Number.MAX_SAFE_INTEGER },
  ]);
    return {
        success:true,
        message:"Dashboard list",
        Dashboardllist,
        numberOfPages,
        DashboardCount
    };
}
async function deleteDashboard(body){
    const updated= await Dashboard.findByIdAndUpdate(body?._id,{$set:{isDeleted:body?.isDeleted}},{new:true})
    return{
        success:true,
        message:"Dashboard Deleted successfully",
        updated
    }
}
async function isActiveDashboard(body){
    const isupdated= await Dashboard.updateMany({isActive:true},{$set:{isActive:false}},{new:true})
    const updated= await Dashboard.findByIdAndUpdate(body?._id,{$set:{isActive:body?.isActive}},{new:true})

    return{
        success:true,
        message:"Dashboard Deleted successfully",
        updated
    }
}
async function updateDashboard(body){
    const updated= await Dashboard.findByIdAndUpdate(body?._id,{$set:{...body}},{new:true})
    return{
        success:true,
        message:"Dashboard Updated successfully",
        updated
    }
}
async function dashboardData(query){
    const dashboardData= await Dashboard.findOne({isActive:true}).lean()
    const carousels= await Carousel.find({_id:{$in:dashboardData?.carousels}}).lean();
    const Categorylist= await Category.find({_id:{$in:dashboardData?.categoryIds}}).lean();
    const ProductList={}
    for await (const category of Categorylist){
        const productData = await Product.find({category:category._id}).limit(query?.limit?query?.limit:0).lean();
        ProductList[category.name]= productData
    }
    return{
        success:true,
        message:"Dashboard Updated successfully",
        carousels,
        ProductList
    }
}
module.exports = { getDashboard, createDashboard,deleteDashboard,updateDashboard,dashboardData,isActiveDashboard};

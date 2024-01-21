const { serve } = require("swagger-ui-express");
const Dashboard = require("../models/dashboard.model");
const Carousel = require("../models/carousel.model");
const Category = require("../models/category.model");
const Product = require("../models/product.model");
const User = require("../models/user.model");
const Order = require("../models/order.model");
const moment = require('moment');

const statusArray = ['PENDING', 'PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']
// Create a new cart for a user
async function createDashboard(dashboard) {
    let search = []
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
    const Dashboards = await new Dashboard({ name: dashboard?.name, carousels: dashboard.carousels, categoryIds: dashboard.categoryIds });
    const createdDashboards = await Dashboards.save();
    return {
        success: true,
        message: "Dashboard created successfuly",
        createdDashboards
    };
}
async function getDashboard(query) {
    let search = [{ isDeleted: false }]
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
    const Dashboardllist = await Dashboard.aggregate([
        { $match: { $and: search } },
        { $sort: { createdAt: -1 } },
        { $skip: (pageNumber - 1) * pageSize },
        { $limit: pageSize ? pageSize : Number.MAX_SAFE_INTEGER },
    ]);
    return {
        success: true,
        message: "Dashboard list",
        Dashboardllist,
        numberOfPages,
        DashboardCount
    };
}
async function deleteDashboard(body) {
    const updated = await Dashboard.findByIdAndUpdate(body?._id, { $set: { isDeleted: body?.isDeleted } }, { new: true })
    return {
        success: true,
        message: "Dashboard Deleted successfully",
        updated
    }
}
async function isActiveDashboard(body) {
    const isupdated = await Dashboard.updateMany({ isActive: true }, { $set: { isActive: false } }, { new: true })
    const updated = await Dashboard.findByIdAndUpdate(body?._id, { $set: { isActive: body?.isActive } }, { new: true })

    return {
        success: true,
        message: "Dashboard Deleted successfully",
        updated
    }
}
async function updateDashboard(body) {
    const updated = await Dashboard.findByIdAndUpdate(body?._id, { $set: { ...body } }, { new: true })
    return {
        success: true,
        message: "Dashboard Updated successfully",
        updated
    }
}
async function dashboardData(query) {
    const dashboardData = await Dashboard.findOne({ isActive: true }).lean()
    const carousels = await Carousel.find({ _id: { $in: dashboardData?.carousels } }).lean();
    const Categorylist = await Category.find({ _id: { $in: dashboardData?.categoryIds } }).lean();
    const ProductList = {}
    for await (const category of Categorylist) {
        const productData = await Product.find({ category: category._id }).limit(query?.limit ? query?.limit : 0).lean();
        ProductList[category.name] = productData
    }
    return {
        success: true,
        message: "Dashboard Updated successfully",
        carousels,
        ProductList
    }
}
async function getAdminDashboardData() {
    try {
        const today = new Date();
        // Get the date 30 days ago
        const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
        const endDate = moment().endOf('day');
        const startDate = moment().subtract(30, 'days').startOf('day');
        const weeklyCounts = [];
        const weeklyCountsuser = [];
        for (i = 0; i < 30; i += 7) {
            const weekStartDate = startDate.clone().add(i, 'days');
            const weekEndDate = weekStartDate.clone().add(6, 'days');

            // Query the database for orders within the current week
            const weeklyCount = await User.countDocuments({
                role: "CUSTOMER",
                createdAt: {
                    $gte: weekStartDate.toDate(),
                    $lte: weekEndDate.endOf('day').toDate(),
                },
            });

            // Add the count data to the array
            weeklyCountsuser.push({
                week: Math.ceil((30 - i) / 7), // Calculate the week number
                count: weeklyCount,
            });
        }
        for (i = 0; i < 30; i += 7) {
            const weekStartDate = startDate.clone().add(i, 'days');
            const weekEndDate = weekStartDate.clone().add(6, 'days');

            // Query the database for orders within the current week
            const weeklyCount = await Order.countDocuments({
                orderDate: {
                    $gte: weekStartDate.toDate(),
                    $lte: weekEndDate.endOf('day').toDate(),
                },
            });

            // Add the count data to the array
            weeklyCounts.push({
                week: Math.ceil((30 - i) / 7), // Calculate the week number
                count: weeklyCount,
            });
        }
        const user = await User.aggregate([
            {
                $facet: {
                    getAllCustomerCount: [{ $match: { role: "CUSTOMER" } }, { $count: "total" }],
                    getResent5user: [{ $match: {} },
                    { $sort: { createdAt: -1 } }, { $limit: 5 }],
                }
            }
        ])
        const product = await Product.aggregate([
            {
                $facet: {
                    getAllProductCount: [{ $match: {} }, { $count: "total" }],
                    getResent5product: [{ $match: {} }, {
                        $lookup: {
                            from: 'categories',
                            localField: 'category',
                            foreignField: '_id',
                            as: 'categoryData',
                        }
                    },
                    {
                        $lookup: {
                            from: 'categories',
                            localField: 'parentCategory',
                            foreignField: '_id',
                            as: 'parentCategoryData',
                        }
                    },
                    {
                        $unwind: {
                            path: '$categoryData',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $unwind: {
                            path: '$parentCategoryData',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    { $sort: { createdAt: -1 } }, { $limit: 5 }],
                }
            }
        ])
        console.log(new Date(new Date().getFullYear(), new Date().getMonth() - 6, 1), new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1))
        const order = await Order.aggregate([
            {
                $facet: {
                    getAllOrderCount: [{ $match: {} }, { $count: "total" }],
                    getResent5orders: [{ $match: {} }, {
                        $lookup: {
                            from: 'products',
                            localField: 'product',
                            foreignField: '_id',
                            as: 'product',
                        }
                    },
                    {
                        $unwind: {
                            path: '$product',
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    { $sort: { createdAt: -1 } }, { $limit: 5 }],
                    last30DaysOrder: [{ $match: { createdAt: { $gte: thirtyDaysAgo, $lte: today } } }, { $count: "total" }],
                    totalOrderByStatus: [{ $group: { _id: "$orderStatus", count: { $sum: 1 } } },
                    { $sort: { count: -1 } }],
                }
            }
        ])

        const statusCountsMap = new Map(
            order[0]?.totalOrderByStatus.map((item) => [
                item._id,
                item.count,
            ]),
        );
        const finalStatusCounts = {};
        statusArray.forEach((_id) => {

            finalStatusCounts[_id] = statusCountsMap.get(_id) || 0;

        });
        let newwekleyArray = weeklyCounts.map(x => { return x.count })
        let newwekleyArrayuser = weeklyCountsuser.map(x => { return x.count })

        let orderData = {
            getAllOrderCount: order[0]['getAllOrderCount'][0]['total'],
            getResent5orders: order[0]['getResent5orders'],
            last30DaysOrder: order[0]['last30DaysOrder'][0]['total'],
            totalOrderByStatus: finalStatusCounts,
            last30daysweekwiseData: newwekleyArray,
        }
        let userData = {
            last30daysweekwiseData: newwekleyArrayuser,
            getAllCustomerCount: user[0]['getAllCustomerCount'][0]['total'],
            getResent5user: user[0]['getResent5user'],

        }
        let productData = {
            getResent5product: product[0]['getResent5product'],
            getAllProductCount: product[0]['getAllProductCount'][0]['total'],
        }

        return { user: userData, product: productData, order: orderData }
    } catch (error) {
        console.log(error)
    }
}
module.exports = { getDashboard, createDashboard, deleteDashboard, updateDashboard, dashboardData, isActiveDashboard, getAdminDashboardData };

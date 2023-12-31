const Address = require("../models/address.model.js");
const Order = require("../models/order.model.js");
const OrderItem = require("../models/orderItems.js");
const cartService = require("../services/cart.service.js");
const razorpay = require("../config/razorpayClient");
async function createOrder(user, shippAddress) {
  let address;
  if (shippAddress._id) {
    let existedAddress = await Address.findById(shippAddress._id);
    address = existedAddress;
  } else {
    address = new Address(shippAddress);
    address.user = user;
    await address.save();

    user.addresses.push(address);
    await user.save();
  }

  const cart = await cartService.findUserCart(user._id);


  const RPOrder = {
    amount: cart.totalDiscountedPrice * 100,
    currency: "INR"
  }
  let createRPorder = await razorpay.orders.create(RPOrder);
  let orders = []
  for await (const item of cart.cartItems) {
    const createdOrder = new Order({
      user: item.userId,
      price: item.price,
      product: item.product,
      quantity: item.quantity,
      size: item.size,
      discountedPrice: item.discountedPrice,

      shippingAddress: address,
      orderDate: new Date(),
      orderStatus: "PENDING", // Assuming OrderStatus is a string enum or a valid string value
      "paymentDetails.status": "PENDING", // Assuming PaymentStatus is nested under 'paymentDetails'
      createdAt: new Date(),
      order_id: createRPorder?.id
    });
    const savedOrder = await createdOrder.save();
    orders.push(savedOrder)
  }



  // for (const item of orderItems) {
  //   item.order = savedOrder;
  //   await item.save();
  // }
  return Object.assign({ orderItem: orders }, { shippingAddress: address, totalDiscountedPrice: cart.totalDiscountedPrice, discounte: cart.discounte, totalPrice: cart.totalPrice, totalItem: cart.totalItem }, { success: true, message: "orders place successfully" });
}

async function placedOrder(orderId) {
  const order = await findOrderById(orderId);
  order.orderStatus = "PLACED";
  order.paymentDetails.status = "COMPLETED";
  return await order.save();
}

async function confirmedOrder(orderId) {
  const order = await findOrderById(orderId);
  order.orderStatus = "CONFIRMED";
  return await order.save();
}

async function shipOrder(orderId) {
  const order = await findOrderById(orderId);
  order.orderStatus = "SHIPPED";
  return await order.save();
}

async function deliveredOrder(orderId) {
  const order = await findOrderById(orderId);
  order.orderStatus = "DELIVERED";
  return await order.save();
}

async function cancelledOrder(orderId) {
  const order = await findOrderById(orderId);
  order.orderStatus = "CANCELLED"; // Assuming OrderStatus is a string enum or a valid string value
  return await order.save();
}

async function findOrderById(orderId) {
  const order = await Order.findById(orderId)
    .populate("user")
    .populate('product')
    .populate("shippingAddress");

  return order;
}
async function findOrder_Id(order_id) {
  const order = await Order.findOne({ order_id: order_id })
    .populate("user")
    .populate('product')
    .populate("shippingAddress");

  return order;
}

async function usersOrderHistory(userId, orderStatus) {
  try {
    let search = [{ user: userId }]
    let obj = { user: userId }
    if (orderStatus && orderStatus!='PLACED') {
      obj.orderStatus = orderStatus
      search.push({orderStatus:orderStatus})
    }
    search.push({orderStatus:{$ne:"PENDING"}})
    const orders = await Order.find({$and:search}).populate('product').sort({ "createdAt": -1 })
      .lean();


    return orders;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function getAllOrders(query) {
  try {
    // return await Order.find().populate("user").populate('product').populate("shippingAddress").lean();;
    let search = [{ isActive: true }, { isDeleted: false }]
    var pageNumber = 1;
    var pageSize = 0;
    if (query?.pageNumber && Number(query.pageNumber)) {
      pageNumber = Number(query.pageNumber);
    }
    if (query?.pageSize && Number(query.pageSize)) {
      pageSize = Number(query.pageSize);
    }
    if(query?.orderStatus && query?.orderStatus !=="ALL"){
      search.push({orderStatus:query?.orderStatus})
    }
    if(query?.searchTerm){
      search.push({
        $or: [
          { 'product.title': { $regex: query.searchTerm, $options: 'i' } },
          { 'shippingAddress.firstName': { $regex: query.searchTerm, $options: 'i' } },
          { 'shippingAddress.lastName': { $regex: query.searchTerm, $options: 'i' } },
          { 'shippingAddress.streetAddress': { $regex: query.searchTerm, $options: 'i' } },
          { 'shippingAddress.city': { $regex: query.searchTerm, $options: 'i' } },
          { 'shippingAddress.state': { $regex: query.searchTerm, $options: 'i' } },
          { 'shippingAddress.mobile': { $regex: query.searchTerm, $options: 'i' } },
        ],
      })
    }
 
    
    const Orderslist = await Order.aggregate([
     
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'product',
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        }
      },
      {
        $lookup: {
          from: 'addresses',
          localField: 'shippingAddress',
          foreignField: '_id',
          as: 'shippingAddress',
        }
      },
      {
        $unwind: {
          path: '$shippingAddress',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$product',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
      { $match: { $and: search } },
      { $sort: { createdAt: -1 } },
      { $skip: (pageNumber - 1) * pageSize },
      { $limit: pageSize ? pageSize : Number.MAX_SAFE_INTEGER },
    ]);
    const Orderslist2 = await Order.aggregate([
     
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'product',
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        }
      },
      {
        $lookup: {
          from: 'addresses',
          localField: 'shippingAddress',
          foreignField: '_id',
          as: 'shippingAddress',
        }
      },
      {
        $unwind: {
          path: '$shippingAddress',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$product',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
      { $match: { $and: search } },
      { $sort: { createdAt: -1 } }     
    ]);
    const OrderCount =Orderslist2.length 
    var numberOfPages = pageSize === 0 ? 1 : Math.ceil(OrderCount / pageSize);
    return {
      success: true,
      message: "Order list",
      Orderslist,
      numberOfPages,
      OrderCount
    };
  } catch (error) {
    console.log("error - ", error)
    throw new Error(error.message)
  }

}

async function deleteOrder(orderId) {
  const order = await findOrderById(orderId);
  if (!order) throw new Error("order not found with id ", orderId)

  await Order.findByIdAndDelete(orderId);
}

module.exports = {
  createOrder,
  placedOrder,
  confirmedOrder,
  shipOrder,
  deliveredOrder,
  cancelledOrder,
  findOrderById,
  usersOrderHistory,
  getAllOrders,
  deleteOrder,
  findOrder_Id
};

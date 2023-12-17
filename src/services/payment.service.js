const razorpay = require("../config/razorpayClient");
const orderService = require("../services/order.service.js");
const CartItem = require("../models/cartItem.model")
const crypto = require('crypto');
const Cart = require("../models/cart.model");
const Product = require("../models/product.model");

const createPaymentLink = async (orderId) => {
  // const { amount, currency, receipt, notes } = reqData;


  try {

    const order = await orderService.findOrderById(orderId);

    const paymentLinkRequest = {
      amount: order.totalPrice * 100,
      currency: 'INR',
      key: "rzp_test_V58aNPoa7wSiXe",
      customer: {
        name: order.user.firstName + ' ' + order.user.lastName,
        contact: "7222938282",
        email: order.user.email,
      },
      notify: {
        sms: true,
        email: true,
      },
      reminder_enable: true,
      callback_url: `https://ecomfrontend-snowy.vercel.app/payment/${orderId}`,
      callback_method: 'get',
    };

    const paymentLink = await razorpay.paymentLink.create(paymentLinkRequest);

    const paymentLinkId = paymentLink.id;
    const payment_link_url = paymentLink.short_url;



    // Return the payment link URL and ID in the response
    const resData = {
      paymentLinkId: paymentLinkId,
      payment_link_url,
    };
    return resData;
  } catch (error) {
    console.error('Error creating payment link:', error);
    throw new Error(error.message);
  }
}

const updatePaymentInformation = async (reqData) => {

  try {
    // Fetch order details (You will need to implement the 'orderService.findOrderById' function)
   const{orderData}=reqData

      if (orderData && orderData['orderItem'].length > 0) {
        for await (const order of orderData['orderItem']) {
          const order1 = await orderService.findOrderById(order._id);
          if(!order1) continue;

          // Fetch the payment details using the payment ID
          // const payment = await razorpay.payments.fetch(paymentId);
      
            order1.paymentDetails.paymentId = orderData['paymentId'];
            order1.paymentDetails.status = 'COMPLETED';
            order1.orderStatus = 'PLACED';
      
      
      
            let saveOrderData = await order1.save()
            const { user } = saveOrderData.toObject()
            const cartData = await Cart.findOne({ user: user._id }).lean()
          await CartItem.deleteOne({ product: order1['product']._id,cart:cartData._id })
          await Product.findByIdAndUpdate(order1['product']._id, { $inc: { quantity: -order1['quantity'] } })
        
      }
    }
    // console.log('payment status', order);
    const resData = { message: 'Your order is placed', success: true };
    return resData
  } catch (error) {
    console.error('Error processing payment:', error);
    throw new Error(error.message)
  }
}


module.exports = { createPaymentLink, updatePaymentInformation }
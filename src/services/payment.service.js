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
  const orderId = reqData.order_id;
  const paymentId = reqData.payment_id;

  try {
    // Fetch order details (You will need to implement the 'orderService.findOrderById' function)
    const body = orderId + "|" + paymentId
    const generate_signature = crypto.createHmac('sha256', 'rzp_test_V58aNPoa7wSiXe').update(body.toString()).digest('hex')
    if (generate_signature != reqData.signature) {
      // return {
      //   success :false,
      //   message:"Unable to verify Payment"
      // }
    }
    const order = await orderService.findOrder_Id(orderId);

    // Fetch the payment details using the payment ID
    const payment = await razorpay.payments.fetch(paymentId);


    if (payment.status === 'captured') {


      order.paymentDetails.paymentId = paymentId;
      order.paymentDetails.status = 'COMPLETED';
      order.orderStatus = 'PLACED';



      let saveOrderData = await order.save()
      const { user, orderItems } = saveOrderData.toObject()
      const cartData = await Cart.findOne({ user: user._id }).lean()
      if (orderItems && orderItems.length > 0) {
        for await (const order of orderItems) {
          await CartItem.deleteOne({ product: order['product']._id,cart:cartData._id })
          await Product.findByIdAndUpdate(order['product']._id, { $inc: { quantity: -order['quantity'] } })
        }
      }
    }
    console.log('payment status', order);
    const resData = { message: 'Your order is placed', success: true };
    return resData
  } catch (error) {
    console.error('Error processing payment:', error);
    throw new Error(error.message)
  }
}


module.exports = { createPaymentLink, updatePaymentInformation }
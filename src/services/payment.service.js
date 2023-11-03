const razorpay = require("../config/razorpayClient");
const orderService=require("../services/order.service.js");
const crypto = require('crypto')

const createPaymentLink= async (orderId)=>{
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

const updatePaymentInformation=async(reqData)=>{
    const paymentId = reqData.razorpay_payment_id;
  const orderId = reqData.razorpay_order_id;

  try {
    // Fetch order details (You will need to implement the 'orderService.findOrderById' function)
    const body = reqData.razorpay_order_id+"|"+reqData.razorpay_payment_id
    const generate_signature = crypto.createHmac('sha256','rzp_test_V58aNPoa7wSiXe').update(body.toString()).digest('hex')
    if(generate_signature != reqData.razorpay_signature){
return {
  success :false,
  message:"Unable to verify Payment"
}
    }
    const order = await orderService.findOrder_Id(orderId);

    // Fetch the payment details using the payment ID
    const payment = await razorpay.payments.fetch(paymentId);
  

    if (payment.status === 'captured') {
     

      order.paymentDetails.paymentId=paymentId;
      order.paymentDetails.status='COMPLETED'; 
      order.orderStatus='PLACED';
     

     
      await order.save()
    }
    console.log( 'payment status',order);
    const resData = { message: 'Your order is placed', success: true };
    return resData
  } catch (error) {
    console.error('Error processing payment:', error);
    throw new Error(error.message)
  }
}


module.exports={createPaymentLink,updatePaymentInformation}
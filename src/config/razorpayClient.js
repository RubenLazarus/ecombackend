const Razorpay = require('razorpay');

apiKey="rzp_test_V58aNPoa7wSiXe"
apiSecret="T4g8gDgWrWxmflBNfFB1TDdq"

const razorpay = new Razorpay({
    key_id: apiKey,
    key_secret: apiSecret,
  });


  module.exports=razorpay;
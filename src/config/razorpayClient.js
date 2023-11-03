const Razorpay = require('razorpay');

apiKey="rzp_test_MCCNl29eR7GriW"
apiSecret="cWBHJx30jaTlOlvpNLF4CUtI"

const razorpay = new Razorpay({
    key_id: apiKey,
    key_secret: apiSecret,
  });


  module.exports=razorpay;
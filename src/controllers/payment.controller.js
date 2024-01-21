const paymentService = require("../services/payment.service.js")
const PaytmChecksum = require('paytmchecksum')
const https = require('https');
var mid = 'ffyvpw67039918604874'
var mKey = 'yWtPp&P4Gqh!IPTr'
const createPaymentLink = async (req, res) => {

    try {
        const paymentLink = await paymentService.createPaymentLink(req.params.id);
        return res.status(200).send(paymentLink)
    } catch (error) {
        return res.status(500).send(error.message);
    }

}

const updatePaymentInformation = async (req, res) => {

    try {
        const payment = await paymentService.updatePaymentInformation(req.body)
        return res.status(200).send({ payment })
    } catch (error) {
        return res.status(500).send(error.message);
    }

}
const paylater = async (req, res) => {

    try {
        const payment = await paymentService.paylater(req.body)
        return res.status(200).send({ payment })
    } catch (error) {
        return res.status(500).send(error.message);
    }

}
const paytm = async (req, res) => {

    try {
        const { amount, email } = req.body
        const totalAmount = JSON.stringify(amount)

        var orderId = `ORDERID_${Date.now()}`
        var custId = `CUST_${Date.now()}`
        var params = {};

        (params['MID'] = mid),
            (params['WEBSITE'] = "DEFAULT"),
            (params['CHANNEL_ID'] = "WEB"),
            (params['INDUSTRY_TYPE_ID'] = "Retail"),
            (params['ORDER_ID'] = orderId),
            (params['CUST_ID'] = custId),
            (params['TXN_AMOUNT'] = totalAmount),
            (params['CALLBACK_URL'] = "https://ecombackend-dgdu.onrender.com/ap/payment/callback"),
            (params['EMAIL'] = email),
            (params['MOBILE_NO'] = "7000652279");

        var paytmChecksum = PaytmChecksum.generateSignature(params, mKey);
        paytmChecksum.then(function (checksum) {
            let paytmParams = {
                ...params,
                CHECKSUMHASH: checksum,
            };
            return  res.status(200).send({ paytmParams })

        }).catch(function (error) {
            return res.status(500).send(error.message);
        });

        // const payment = await paymentService.paylater(req.body)
        //  res.status(200).send({ payment })
    } catch (error) {
        return res.status(500).send(error.message);
    }

}

const paytmCallback = async (req, res) => {
    try {
        const { ORDERID, RESPMSG } = req.body
        var paytmChecksum = req.body.CHECKSUMHASH;
        delete req.body.CHECKSUMHASH;

        var isVerifySignature = PaytmChecksum.verifySignature(req.body, key, paytmChecksum);


        if (isVerifySignature) {
            console.log("Checksum Matched");
            if (req.body.STATUS === "TXN_SUCCESS") {
                return res.redirect(`http://localhost:3000/success?orderId=${ORDERID}&message=${RESPMSG}`)
            } else {
                return res.redirect(`http://localhost:3000/success?orderId=${ORDERID}&message=${RESPMSG}`)
            }
        } else {
            console.log("checksum mismatched");
            return res.send("Something went wrong")
        }

    } catch (error) {
        console.error(error)
        res.status(500).send("callback fail")
    }
}
const paytm2 = async (req,res)=>{

    var orderId = `ORDERID_${Date.now()}`
    var custId = `CUST_${Date.now()}`
    var paytmParams = {};

    paytmParams.body = {
        "requestType"   : "Payment",
        "mid"           : mid,
        "websiteName"   : "ECOM",
        "orderId"       : orderId,
        "callbackUrl"   : "http://localhost:3002/api/payments/callback",
        "txnAmount"     : {
            "value"     : "1.00",
            "currency"  : "INR",
        },
        "userInfo"      : {
            "custId"    : custId,
        },
    };
    
    /*
    * Generate checksum by parameters we have in body
    * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys 
    */
    PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), "YOUR_MERCHANT_KEY").then(function(checksum){
    
        paytmParams.head = {
            "signature"    : checksum
        };
    
        var post_data = JSON.stringify(paytmParams);
    
        var options = {
    
            /* for Staging */
            hostname: 'securegw-stage.paytm.in',
    
            /* for Production */
            // hostname: 'securegw.paytm.in',
    
            port: 443,
            path: '/theia/api/v1/initiateTransaction?mid=YOUR_MID_HERE&orderId=ORDERID_98765',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': post_data.length
            }
        };
    
        var response = "";
        var post_req = https.request(options, function(post_res) {
            post_res.on('data', function (chunk) {
                response += chunk;
            });
    
            post_res.on('end', function(){
                console.log('Response: ', response);
            });
        });
    
        post_req.write(post_data);
        post_req.end();
    });
}


module.exports = { createPaymentLink, updatePaymentInformation, paylater, paytm, paytmCallback,paytm2 }
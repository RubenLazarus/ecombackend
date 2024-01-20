const paymentService = require("../services/payment.service.js")
const PaytmChecksum = require('paytmchecksum')
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
            (params['CALLBACK_URL'] = "https://ecombackend-dgdu.onrender.com/api/payments/callback"),
            (params['EMAIL'] = email),
            (params['MOBILE_NO'] = "7000652279");

        var paytmChecksum = PaytmChecksum.generateSignature(params, mKey);
        paytmChecksum.then(function (checksum) {
            let paytmParams = {
                ...params,
                CHECKSUMHASH: checksum,
            };
            res.json(paytmParams)

        }).catch(function (error) {
            console.log(error);
        });

        const payment = await paymentService.paylater(req.body)
        return res.status(200).send({ payment })
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


module.exports = { createPaymentLink, updatePaymentInformation, paylater, paytm, paytmCallback }
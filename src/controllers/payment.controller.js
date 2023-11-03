const paymentService=require("../services/payment.service.js")

const createPaymentLink=async(req,res)=>{

    try {
        const paymentLink=await paymentService.createPaymentLink(req.params.id);
        return res.status(200).send(paymentLink)
    } catch (error) {
        return res.status(500).send(error.message);
    }

}

const updatePaymentInformation=async(req,res)=>{

    try {
       const payment= await paymentService.updatePaymentInformation(req.query)
        return res.status(200).send({payment})
    } catch (error) {
        return res.status(500).send(error.message);
    }

}

module.exports={createPaymentLink,updatePaymentInformation}
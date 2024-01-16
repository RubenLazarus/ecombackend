const express=require("express");
const authenticate = require("../middleware/authenticat.js");
const router=express.Router();
const paymentController=require("../controllers/payment.controller.js");

router.post("/:id",authenticate,paymentController.createPaymentLink);
router.post("/",authenticate,paymentController.updatePaymentInformation);
router.post("/paylater",authenticate,paymentController.paylater);
router.post("/paytm",authenticate,paymentController.paytm);
router.post("/callback",authenticate,paymentController.paytmCallback);


module.exports=router;
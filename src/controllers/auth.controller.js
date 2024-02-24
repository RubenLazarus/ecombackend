const userService=require("../services/user.service.js")
const jwtProvider=require("../config/jwtProvider.js")
const bcrypt=require("bcrypt")
const cartService=require("../services/cart.service.js")
const fs = require('fs');
const AWS = require('aws-sdk');
const mailService = require('../services/mail.service.js')
const otpModel = require('../models/otp.model.js')
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });
const register=async(req,res)=>{

    try {
        const user=await userService.createUser(req.body);
        const jwt=jwtProvider.generateToken(user._id);

        await cartService.createCart(user);

        return res.status(200).send({jwt,message:"register success"})

    } catch (error) {
        return res.status(500).send({error:error.message})
    }
}
const changeUserPassword=async(req,res)=>{

    try {
        const user=await userService.updatePassword(req.body);

        return res.status(200).send({success:true,message:"Password successfully changed"})

    } catch (error) {
        return res.status(500).send({error:error.message})
    }
}
const login=async(req,res)=>{
    const {password,email}=req.body
    try {
        const user = await userService.getUserByEmail(email);

        if (!user) {
            return res.status(404).json({ message: 'User not found With Email ', email});
        }

        const isPasswordValid=await bcrypt.compare(password,user.password)

        if(!isPasswordValid){
            return res.status(401).json({ message: 'Invalid password' });
        }

        const jwt=jwtProvider.generateToken(user._id);

        return res.status(200).send({jwt,message:"login success"});

    } catch (error) {
        return res.status(500).send({error:error.message})
    }
}
const uploadFiles = async(req,res)=>{
  const file = req.file
  if(!file){
    return res.status(200).send({
        success:false,
        message:"File not found"
    })
  }
  const fileContent = fs.readFileSync(file.path);
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: `${Date.now()}-${file.originalname}`, // File name you want to save as in S3
    Body: fileContent,
  };
  const response = await s3.upload(params, (err, data) => {
    if (err) {
      throw err;
    }
    console.log(`File uploaded successfully. ${data.Location}`);
  }).promise();
  fs.unlinkSync(file.path)
  return res.status(200).send({
    success:true,
    message:"File upload Successfully",
    "Location": response.Location,
    "key": response.key
  }) 
}
const forgotPassword= async (req,res)=>{
  try {
    let {email}= req.body
    email = email.toLowerCase();
    const findUser = await userService.getUserByEmail(email);
  
    if (!findUser) {
      return res.status(200).json({success:false, message: 'User not found With Email ', email});
  }
  const otp = await generateOTP();
  const sendEmail = await mailService.sendOTP(otp,findUser)
  if (sendEmail && sendEmail.accepted.length > 0) {
    let object = {
      email,
      otp,
      creatdAt: new Date(),
    };
    await otpModel.create(object);
  }
  
  return res.status(200).json({
    success:true,
    message:"OTP send to Email address"
  })
  } catch (e) {
    console.log(e)
  }

}
const verifyAndChangePassword =async(req,res)=>{
try {
  let {otp,email,password}= req.body;
  const verify = await otpModel.find({email:email.toLowerCase()}).sort({creatdAt:-1})
  if (verify[0]?.otp != otp) {
    return res.status(200).json({
      success: false,
      message: 'OTP not matched or incorrect',
    })
  }
await otpModel.deleteMany({email:email.toLowerCase()})
const user = await userService.updatePassword({email:email,password:password});
if(!user){
  return res.status(200).json({
    success: false,
    message: 'Unable to chanage password',
  })
}
return res.status(200).json({
  success: true,
  message: 'Password change successfully',
})
} catch (error) {
  console.log(error);
}
}
const generateOTP=async()=> {
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  return otp;
}
module.exports={verifyAndChangePassword,register,login,uploadFiles,changeUserPassword,forgotPassword}
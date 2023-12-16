const userService=require("../services/user.service.js")
const jwtProvider=require("../config/jwtProvider.js")
const bcrypt=require("bcrypt")
const cartService=require("../services/cart.service.js")
const fs = require('fs');
const AWS = require('aws-sdk');
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
module.exports={register,login,uploadFiles,changeUserPassword}
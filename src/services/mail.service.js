const nodemailer = require('nodemailer');
const template = require('./templates.service')




const transporter = nodemailer.createTransport({
    service: 'Gmail', // Change this to your email service provider (e.g., Outlook, SendGrid, etc.)
    auth: {
      user: 'rubenlazarus19@gmail.com', // Replace with your email address
      pass: 'wnkybtrwkgcirikr', // Replace with your email password or an app password
    },
    secure:false,
    requireTLS: false,
    tls: {rejectUnauthorized: false},
    default:{ from: 'Vidhi Rice <rubenlazarus19@gmail.com>',}
  });


  async function sendOTP(otp,userInfo){
    try {
        return await transporter.sendMail({
            from: 'Vidhi Rice <rubenlazarus19@gmail.com>',
            to:userInfo.email,
            subject:"Your OTP Code",
            html: await template.forgotpasswortTemp(otp,userInfo),
            context :{name:'OTP Code Reset Password'}
        })
    } catch (error) {
        console.log(error)
    }
  }

  module.exports = { sendOTP};
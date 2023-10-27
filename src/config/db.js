const mongoose = require("mongoose")

const mongoDbUrl='mongodb+srv://Ruben:44BTGtmQlGsg4bvL@cluster0.6uprek7.mongodb.net/'
const connectDb=()=>{
    return mongoose.connect(mongoDbUrl)
}

module.exports={connectDb}
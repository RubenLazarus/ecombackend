const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 50,
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'categories',
  },
  level: {
    type: Number,
    required: true,
  },
  isDeleted:{
    type:Boolean,
    default:false,
  },
  isActive:{
    type:Boolean,
    default:true,
  },
  createdAt:{
    type:Date,
    default:new Date()
  },
  updatedAt:{
    type:Date,
    default:new Date()
  },
  imageUrl:{
    type:String
  },
  description:{
    type:String
  }
});

const Category = mongoose.model('categories', categorySchema);

module.exports = Category;

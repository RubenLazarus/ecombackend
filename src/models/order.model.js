const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchema = new Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    // required: true,
  },
  orderDate: {
    type: Date,
    required: true,
  },
  deliveryDate: {
    type: Date,
  },
  shippingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'addresses',
  },
  paymentDetails: {
    
    paymentMethod: {
      type: String,
    },
    transactionId: {
      type: String,
    },
    paymentId:{
      type:String,
    },
    paymentStatus:{
      type:String
    }
    
  },
  discounte: {
    type: Number
  },
  orderStatus: {
    type: String,
    required: true,
  },
  order_id: {
    type: String,
  },
  totalItem: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'products',
    required: true,
  },
  size: {
    type: String,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  discountedPrice: {
    type: Number,
  },
  deliveryDate: {
    type: Date,
  },
  isActive:{
    type:Boolean,
    default:true
  },
  isDeleted:{
    type:Boolean,
    default:false
  }
});

const Order = mongoose.model('orders', orderSchema);

module.exports = Order;

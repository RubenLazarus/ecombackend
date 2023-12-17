const mongoose = require('mongoose');
const { Schema } = mongoose;

const ratingSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'products',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
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

const Rating = mongoose.model('ratings', ratingSchema);

module.exports = Rating;

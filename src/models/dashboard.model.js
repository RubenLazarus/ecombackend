const mongoose = require('mongoose');
const { Schema } = mongoose;

const dashboardSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    carousels: {
        type: Array,
        required: true,
    },
    categoryIds: {
        type: Array,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
    updatedAt: {
        type: Date,
        default: new Date()
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

const Dashboard = mongoose.model('dashboard', dashboardSchema);

module.exports = Dashboard;

const mongoose = require('mongoose');
const { Schema } = mongoose;

const otpSchema = new Schema({
    otp: {
        type: String,
        required: true,
    },
    email: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true,
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
    }
});

const Otp = mongoose.model('otp', otpSchema);

module.exports = Otp;

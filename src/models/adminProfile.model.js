const mongoose = require('mongoose');
const { Schema } = mongoose;

const adminProfileSchema = new Schema({
    logo: {
        type: String,
        required: true,
    },
    companyName: {
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

const adminProfile = mongoose.model('adminprofile', adminProfileSchema);

module.exports = adminProfile;

const mongoose = require('mongoose');
const { Schema } = mongoose;

const carouselSchema = new Schema({
    image: {
        type: String,
        required: true,
    },
    path: {
        type: String,
        required: true,
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

const Carousel = mongoose.model('carousel', carouselSchema);

module.exports = Carousel;

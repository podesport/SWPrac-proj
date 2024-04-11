const mongoose = require('mongoose')

const BookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    hotel: {
        type: mongoose.Schema.ObjectId,
        ref: 'Hotel',
        required: true
    },
    bookingDate: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true,
        min: 1,
        max: 3 // Maximum duration of 3 nights
    },
    createAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', BookingSchema);
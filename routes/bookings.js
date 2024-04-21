const express = require('express');
const router = express.Router()

const {
    getBookings,
    getBooking,
    createBooking,
    updateBooking,
    deleteBooking
} = require('../controllers/bookings')
const { protect, authorize } = require('../middleware/auth');

router.route('/').get(protect,getBookings)
router.route('/:hotelID/hotel').post(protect,authorize('admin', 'user'),createBooking)
router.route('/:id').get(protect,getBooking).put(protect,authorize('admin', 'user'),updateBooking).delete(protect,authorize('admin', 'user'),deleteBooking)
// router.route('/:id/download/pdf')

// router.route('/').get(protect, getBookings).post(protect, authorize('admin', 'user'), createBooking);
// router.route('/:id').get(protect, getBooking).put(protect, authorize('admin', 'user'), updateBooking).delete(protect, authorize('admin', 'user'), deleteBooking);


module.exports = router;
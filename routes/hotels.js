const express = require('express');
const router = express.Router()

const {
    getHotels,
    getHotel,
    createHotel,
    updateHotel,
    deleteHotel
} = require('../controllers/hotels');


router.route('/').get(getHotels).post(createHotel)
router.route('/:id').get(getHotel).put(updateHotel).delete(deleteHotel)


module.exports = router;
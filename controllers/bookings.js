const jsPDF = require('jspdf');
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');

//@desc Get all booking
//@route GET /api/v1/booking
//@access Public
exports.getBookings = async (req, res, next) => {
    const id = req.user.id;
    const role = req.user.role;
    let query;
    if (role !== 'admin') {
        query = Booking.find({ user: req.user.id }).populate({
            path: 'hotel',
            select: 'name province tel'
        });
    } else if (req.params.hotelID) {
        query = Booking.find({ hotel: req.params.hotelID }).populate({
            path: 'Hotel',
            select: 'name province tel'
        });
    } else {
        query = Booking.find().populate({
            path: 'hotel',
            select: 'name province tel'
        });
    }
    try {
        const booking = await query;
        res.status(200).json({
            succes: true,
            count: booking.length,
            data: booking
        });
    } catch (err) {
        return res.status(500).json({
            succes: false,
            message: "Can not find booking"
        });
    }
}

//@desc Get single booking
//@route GET /api/v1/booking/:booking_id
//@access Public
exports.getBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id).populate({
            path: 'booking',
            select: "name province tel"
        })
        if (!booking) {
            return res.status(400).json({
                succes: false,
                message: `No booking with the id of ${req.params.id}`
            });
        }
        res.status(200).json({
            succes: true,
            data: booking
        })
    } catch (err) {
        return res.status(500).json({
            succes: false,
            message: "Can not find booking"
        });
    }
}

//@desc Add booking
//@route POST /api/v1/booking/:hotel_id/hotel
//@access Private
exports.createBooking = async (req, res, next) => {
    try {
        const hotel = await Hotel.findById(req.params.hotelID);
        if (!hotel) {
            return res.status(400).json({
                succes: false,
                message: `No booking with the id of ${req.params.id}`
            });
        }

        const nights = req.body.nights;
        if (!nights) {
          throw "nights is required";
        }
        if (nights < 1 || nights > 3) {
          return res.status(400).json({
            success: false,
            message: `The nights number is invalid`,
          });
        }
        delete req.body.nights;

        const startDate = new Date(req.body.startDate);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + nights);
        req.body.endDate = endDate;
        req.body.user = req.user.id;
        req.body.hotel = req.params.hotelID ;

        const cumulativeBooking = await Booking.find({user:req.user.id});
        const existingBookings = await Booking.find({
            user:req.user.id,
            hotel: req.params.hotelID,
            $or: [
                { startDate: { $lt: endDate }, endDate: { $gt: startDate } },
            ]
        });

        if (existingBookings.length > 0) {
            return res.status(400).json({
                succes: false,
                message: `There is already a booking that overlaps with these dates.`
            });
        } 

        if (cumulativeBooking  >= 3 && req.user.role !== 'admin'){
            return res.status(400).json({
                succes: false,
                message: `User ID ${req.params.id} has 3 bookings ago and cannot bookings again.`
            });
        }

        const booking = await Booking.create(req.body);
        return res.status(200).json({
            succes: true,
            data: booking
        });      
    
    }catch(err) {
        // console.log(err)
        return res.status(500).json({
            success: false,
            message: "Cannot create booking"
        });
    }
}

//@desc Update booking
//@route PUT /api/v1/booking/:booking_id
//@access Private
exports.updateBooking = async (req, res, next) => {
    try {
        let booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: `No booking with id of ${req.params.id}`
            });
        }
        //Make sure user is the booking owner
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to update this appointment`
            });
        }
        booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({
            success: true,
            data: booking
        });
    }catch(error){
        // console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot update booking"
        });
    }
}

//@desc Delete booking
//@route DELETE /api/v1/booking/:booking_id
//@access Private
exports.deleteBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: `No booking with the id of ${req.params.id}`,
            });
        }
    
        if (booking.user.toString() !== req.user.id &&
            req.user.role !== "admin"
        ) {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to delete this booking`,
            });
        }
        console.log(booking)
        await booking.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ success: false, message: "Cannot delete booking" });
    }
}


exports.getBookingPDF = async (req, res, next) => {
    try {
        // const booking = await Booking.findById(req.params.id).populate({
        //     path: 'hotel',
        //     select: "name province telephone"
        // })
        console.log(req.params.id);
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(400).json({
                succes: false,
                message: `No booking with the id of ${req.params.id}`
            });
        }
        res.status(200).json({
            succes: true,
            data: booking
        })
    } catch (err) {
        return res.status(500).json({
            succes: false,
            message: "Can not find booking"
        });
    }
}
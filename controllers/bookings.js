const fs = require('fs');
const path = require('path');
const { PassThrough } = require('stream');
const PDFDocument = require('pdfkit-table');
const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const User = require('../models/User');

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
        console.log(req.params.id)
        // console.log(Booking.findById(req.params.id))
        const booking = await Booking.findById(req.params.id).populate({
            path: 'hotel',
            select: "name province telephone"
        });
        console.log(booking)
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
        console.log
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
        req.body.hotel = req.params.hotelID;

        const cumulativeBooking = await Booking.find({ user: req.user.id });
        const existingBookings = await Booking.find({
            user: req.user.id,
            hotel: req.params.hotelID,
            $or: [
                { startDate: { $lt: endDate }, endDate: { $gt: startDate } },
            ]
        });

        let currentDate = new Date();
        if (startDate < currentDate) {
            return res.status(400).json({
                succes: false,
                message: `The start date is earlier than today.`
            });
        }

        if (existingBookings.length > 0) {
            return res.status(400).json({
                succes: false,
                message: `There is already a booking that overlaps with these dates.`
            });
        }

        if (cumulativeBooking >= 3 && req.user.role !== 'admin') {
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

    } catch (err) {
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
  
        if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({
                success: false,
                message: `User ${req.user.id} is not authorized to update this appointment`
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

        const startDate = req.body.startDate ? new Date(req.body.startDate) : booking.startDate;
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + nights);
        req.body.endDate = endDate;
        
        let currentDate = new Date();
        if (startDate < currentDate) {
            return res.status(400).json({
                success: false,
                message: `The start date cannot be earlier than today.`
            });
        }
        const overlappingBookings = await Booking.find({
            _id: { $ne: booking._id },
            user: req.user.id,
            hotel: booking.hotel.toString(),
            $or: [
                { startDate: { $lt: endDate }, endDate: { $gt: startDate } },
            ]
        });
        console.log(overlappingBookings);
        if (overlappingBookings.length > 0) {
            return res.status(400).json({
                success: false,
                message: `There is already a booking that overlaps with these dates.`
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
    } catch (error) {
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
        const booking = await Booking.findById(req.params.id).populate({
            path: 'hotel',
            select: "name address district province telephone"
        });
        if (!booking) {
            return res.status(400).json({
                succes: false,
                message: `No booking with the id of ${req.params.id}`
            });
        }
        const user = await User.findById(req.user.id);

        // Create a pass-through stream to capture PDF content
        const bufferStream = new PassThrough();
        let pdfBuffer = Buffer.from('');

        // Pipe the PDF content to the buffer stream
        bufferStream.on('data', (chunk) => {
            pdfBuffer = Buffer.concat([pdfBuffer, chunk]);
        });

        let doc = new PDFDocument({ margin: 30, size: "A4", bufferPages: true });
        doc.pipe(res);

        const userTable = {
            title: "User Information",
            headers: ["Key", "Value"],
            rows: [
                ['User ID:', user._id.toString()],
                ['Name:', user.name],
                ['Email:', user.email],
                ['Telephone:', user.telephone]
            ],
        };
        const bookingDateTable = {
            title: "Booking Date Information",
            headers: ["Key", "Value"],
            rows: [
                ['Booking Date:', booking.createAt],
                ['Start Date:', booking.startDate],
                ['End Date:', booking.endDate]
            ],
        };

        const hotelTable = {
            title: "Hotel Information",
            headers: ["Key", "Value"],
            rows: [
                ['Hotel Name:', booking.hotel.name],
                ['Hotel Address:', booking.hotel.address],
                ['Hotel Province:', booking.hotel.province],
                ['Hotel District:', booking.hotel.district],
                ['Hotel Telephone:', booking.hotel.telephone]
            ],
        };
        doc.font('Helvetica-Bold').fontSize(20).text('Booking Information', { align: 'center' }).moveDown();
        await doc.table(userTable, {})
        await doc.table(bookingDateTable, {})
        await doc.table(hotelTable, {})

        doc.end();
    } catch (err) {
        return res.status(500).json({
            succes: false,
            message: "Can not find booking"
        });
    }
}
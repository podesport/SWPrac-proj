const Hotel = require("../models/Hotel");

exports.getHotels = async (req, res, next) => {
    try {
        const hotels = await Hotel.find();
        res.status(200).json({ success: true, count: hotels.length, data: hotels });
    } catch (err) {
        res.status(400).json({ success: false });
    }
}

exports.getHotel = async (req, res, next) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if(!hotel) {
            return res.status(400).json({ success: false });
        }
        res.status(200).json({ success: true, data: hotel });
    } catch (err) {
        res.status(400).json({ success: false });
    }
}

exports.createHotel = async (req, res, next) => {
    const hotel = await Hotel.create(req.body);
    res.status(201).json({
        success: true,
        data: hotel
    });
}

exports.updateHotel = async  (req, res, next) => {
    try {
        const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body,  {
            new: true,
            runValidators:true
        });

        if(!hotel) {
            return res.status(400).json({ success: false });
        }
        res.status(200).json({ success: true, data: hotel });
    } catch (err) {
        res.status(400).json({ success: false });
    }
}

exports.deleteHotel = async (req, res, next) => {
    try {
        const hotel = await Hotel.findByIdAndDelete(req.params.id);

        if(!hotel) {
            return res.status(400).json({ success: false });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false });
    }
}

const Hotel = require("../models/Hotel");

exports.getHotels = async (req, res, next) => {
    try {
        let query;
        const reqQuery = { ...req.query };
        const removeFields = ["select", "sort", "page", "limit"];
        removeFields.forEach((param) => delete reqQuery[param]);

        let queryStr = JSON.stringify(req.query);
        queryStr = queryStr.replace(
            /\b(gt|gte|lt|lte|in)\b/g,
            (match) => `$${match}`
        );

        // finding resource
        query = Hotel.find(JSON.parse(queryStr))/*.populate('bookings');*/

        // select fields
        if (req.query.select) {
            const fields = req.query.select.split(",").join(" ");
            query = query.select(fields);
        }

        // sort
        if (req.query.sort) {
            const sortBy = req.query.sort.split(",").join(" ");
            query = query.sort(sortBy);
        }

        // pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 25;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const total = await Hotel.countDocuments();

        query = query.skip(startIndex).limit(limit);

        // executing query
        const hotels = await query;

        // pagination result
        const pagination = {};

        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit,
            };
        }

        if (startIndex > 0) {
            pagination.prev = {
                page: page - 1,
                limit,
            };
        }

        res
            .status(200)
            .json({ success: true, count: hotels.length, pagination, data: hotels });
    } catch (err) {
        res.status(400).json({ success: false });
    }
}

exports.getHotel = async (req, res, next) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) {
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

exports.updateHotel = async (req, res, next) => {
    try {
        const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if (!hotel) {
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

        if (!hotel) {
            return res.status(400).json({ success: false });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false });
    }
}

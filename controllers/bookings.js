const jsPDF = require('jspdf');
const Booking = require('../models/Booking');

// TODO
exports.getBookings = async (req, res, next) => {
    res.status(200).send({ "details": "OK" });
}

// TODO
exports.getBooking = async (req, res, next) => {
    res.status(200).send({ "details": "OK" });
}

// TODO
exports.createBooking = async (req, res, next) => {
    res.status(200).send({ "details": "OK" });
}

// TODO
exports.updateBooking = async (req, res, next) => {
    res.status(200).send({ "details": "OK" });
}


// TODO
exports.deleteBooking = async (req, res, next) => {
    res.status(200).send({ "details": "OK" });
}


function convertToPDF(bookingData) {
    const doc = new jsPDF();
    
    doc.text("", 10, 10);
    const pdfDataUri = doc.output('datauristring');
    return pdfDataUri
}
// TODO
exports.getBookingPDF = async (req, res, next) => {
    res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="booking.pdf"'
    });

    const pdfDataUri = convertToPDF({ "test": "test" });
    res.send(pdfDataUri);
}
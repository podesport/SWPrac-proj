const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const { xss } = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

const connectDB = require('./config/db');
const hotels = require('./routes/hotels');
const bookings = require('./routes/bookings');
const auth = require('./routes/auth');


dotenv.config({ path: './config/config.env' });

connectDB();

const app = express();

// Body parser
app.use(express.json());
var cors = require('cors')

app.use(cors())
app.use('/api/v1/auth', auth);
app.use('/api/v1/hotels', hotels);
app.use('/api/v1/bookings', bookings);

const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT));

process.on('unhandleRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1))
})
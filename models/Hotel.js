const mongoose = require("mongoose");

const HotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      trim: true,
      maxlength: [50, "Name can not be more than 50 characters"],
    },
    address: {
      type: String,
      required: [true, "Please add a address"],
    },
    district: {
      type: String,
      required: [true, "Please add a district"],
    },
    province: {
      type: String,
      required: [true, "Please add a province"],
    },
    postalcode: {
      type: String,
      required: [true, "Please add a postalcode"],
      maxlength: [5, "Postal Code can not be more than 5 digits"],
    },
    telephone: {
      type: String,
      required: [true, 'Please add a telephone number'],
      match: [
        /^\+?(\d{1,3})?[-. ]?\(?\d{1,3}\)?[-. ]?\d{1,4}[-. ]?\d{1,4}[-. ]?\d{1,9}$/,
        'Please add a valid telephone number'
      ]
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

HotelSchema.pre("deleteOne",
  {
    document: true,
    query: false
  },
  async function (next) {
    console.log(`Bookings being removed from hotel ${this._id}`);
    await this.model("Booking").deleteMany({hotel: this._id});
    next();
  }
)


module.exports = mongoose.model("Hotel", HotelSchema);

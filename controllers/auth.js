const User = require('../models/User');

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true  // CamelCased 'httpOnly' instead of 'httponly'
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  // Send response with a cookie and token in the body
  res.status(statusCode).cookie('token', token, options).json({  // CamelCased 'statusCode'
    success: true,
    // add fr frontend
    _id: user._id,
    name: user.name,
    email: user.email,
    token
  });
}

//@desc     Register user
//@route    POST /api/v1/auth/register
//@access   Public
exports.register = async (req, res, next) => {
  try {
    const { name, telephone, email, password, role } = req.body;

    const user = await User.create({
      name,
      telephone,
      email,
      password,
      role
    });
    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false });
    console.log(err.stack);
  }
}

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        msg: 'Please provide an email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({
        success: false,
        msg: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        msg: 'Invalid credentials'
      });
    }
    sendTokenResponse(user, 200, res);
  }
  catch (err) {
    return res.status(401).json({ success: false, msg: 'Cannot convert email or password to string' });
  }
};

// @desc    log user out / clear cookie
// @route   GETT /api/v1/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  })
};

// @desc    Get current Logged in user
// @route   POST /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
  // sendTokenResponse(user,200,res) ;
}
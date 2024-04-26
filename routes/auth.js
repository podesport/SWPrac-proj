const express = require('express');
const { register, login, getMe, logout ,deleteUser} = require('../controllers/auth');

const router = express.Router();
const { protect ,authorize} = require('../middleware/auth')

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/logout',protect, logout);


router.delete('/delete/:id',protect,authorize('admin', 'user'), deleteUser);

module.exports = router;

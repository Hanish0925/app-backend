const express = require('express');
const router = express.Router();
const { addMenuItem, getMenu, rateMenuItem, updateMenu } = require('../controllers/menuController');
const { auth, checkRole } = require('../middleware/auth');
router.post('/add', auth, checkRole('admin'), addMenuItem);
router.get('/', auth, getMenu);
router.post('/rate', auth, rateMenuItem);
router.put('/update', auth,checkRole('admin'), updateMenu);
module.exports = router;

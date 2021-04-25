const express = require('express');
const { check } = require('express-validator');

const usersControlles = require('../controller/user-controller');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();

router.get('/', usersControlles.getUsers );
router.post('/signup',
    fileUpload.single('image'),
[
    check('name').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ mih: 6})
], usersControlles.signup );

router.post('/login',[
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ mih: 6})
], usersControlles.login );

module.exports = router;
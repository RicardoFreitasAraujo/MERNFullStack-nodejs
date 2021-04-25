const express = require('express');
const { check } = require('express-validator');

const placesControlles = require('../controller/place-controller');
const fileUpload = require('../middleware/file-upload');
const  checkAuth = require('../middleware/check-auth');

const router = express.Router();

router.get('/:pid', placesControlles.getPlaceById);
router.get('/user/:uid/', placesControlles.getPlaceByUserId);

router.use(checkAuth);

router.post('/', 
    fileUpload.single('image'),
    [check('title')
        .not()
        .isEmpty(),
     check('description')
        .isLength({min: 5}),
     check('address').not().isEmpty()
    ],
    placesControlles.createPlace);

router.patch('/:pid',[
   check('title').not().isEmpty(),
   check('description').isLength({min: 5})
], placesControlles.updatePlaceById)

router.delete('/:pid', placesControlles.deletePlace)

module.exports = router;
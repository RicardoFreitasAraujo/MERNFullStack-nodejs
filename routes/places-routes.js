const express = require('express');
const HttpError = require('../model/http-error');
const placesControlles = require('../controller/place-controller');

const router = express.Router();

router.get('/:pid', placesControlles.getPlaceById);
router.get('/user/:uid/', placesControlles.getPlaceByUserId);

module.exports = router;
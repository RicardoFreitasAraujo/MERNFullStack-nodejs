const HttpError = require('../model/http-error');
const uuid = require('uuid/v4');
const mongoose = require('mongoose');

const { validationResult } = require('express-validator');
const getCoordsForAddress = require('../utils/location');
const Place = require('../model/place');
const User = require('../model/user');




const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;
    let place;
    try {
        place = await Place.findById(placeId);
    } catch(err) {
        const error = new HttpError('Error on finding product', 500);
        return next(error);
    }
    
    if (!place) {
        return next(new HttpError('Could not find a place for the provided id.', 404));
    }

    return res.json({place: place.toObject({getters: true}) });
}

const getPlaceByUserId = async (req, res, next) => {
    const userId = req.params.uid;
    let places;
    try {
        places = await Place.find({ creator: userId });
    }
    catch (ex)
    {
        return next(new HttpError('Fechting places failed, please again later'));
    }
    
    if (!places || places.length === 0) {
        return next(new HttpError('Could not find places for the user id.', 404));
    }

    return res.json({places: places.map(item => item.toObject({ getters: true })) });
};

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs', 422));
    }
    const { title, description, address, creator } = req.body;
    
    let  coordinates; 
    try {
        coordinates = await getCoordsForAddress(address);
    }
    catch (error) {
        return next(new HttpError('Error on GPS'));
    }
    
    let user;
    try {
        user = await User.findById(creator);
    } catch(err) {
        console.log(err);
       return next(new HttpError('Error on finding user')); 
    }

    if (!user) {
        return next(new HttpError('Could not find user for place.', 404)); 
    }

    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: 'https://ibcdn.canaltech.com.br/8FplhVkDQdAatiUcehCimgkGJlI=/512x288/smart/i257652.jpeg',
        creator
    });

    try {
        const session = await mongoose.startSession();
        await session.startTransaction();
        await createdPlace.save({session: session});
        user.places.push(createdPlace);
        await user.save({session: session});
        await session.commitTransaction();
    } catch(err) {
        await session.abortTransaction();
        return next(new HttpError('Creating place failed'));
    }
    
    return res.status(201).json({place: createdPlace});
};

const updatePlaceById = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs', 422));
    }

    const placeId = req.params.pid;
    const { title, description } = req.body;

    let place;
    try {
        place = await Place.findById(placeId);
    }
    catch (err)
    {
        next(new HttpError('Something went wrong'));
    }

    try {
        place.title = title;
        place.description = description;
        await place.save();    
    }
    catch (err)
    {
        next(new HttpError('Error on updtaing record in mongo'));
    }
    
    return res.status(200).json({place: place.toObject({getters: true})});
};


const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;
    console.log('placeId',placeId);
    
    let place;
    try {
        place = await Place.findById(placeId).populate('creator');
    }
    catch(err) {
        console.log(err);
        return next(new HttpError('Something went wrong'));
    }

    if (!place) {
        return next(new HttpError('Place not found', 404));
    }

    let session;
    try {
        session = await mongoose.startSession();
        session.startTransaction();
        await place.remove({session: session});
        place.creator.places.pull(place);
        await place.creator.save({session: session});
        await session.commitTransaction();
    }
    catch(err) {
        console.log(err);
        return next(new HttpError('Error on deleting'));
    }

    res.status(200).json({message: 'Deleted place'});
};


exports.createPlace = createPlace;
exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;
exports.updatePlaceById = updatePlaceById;
exports.deletePlace = deletePlace;
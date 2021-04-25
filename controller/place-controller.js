const fs = require('fs');
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
    console.log(userId);
    
    let userWithPlaces;
    try {
        userWithPlaces = await User.findById(userId).populate('places');
        console.log(userWithPlaces);
    }
    catch (ex)
    {
        return next(new HttpError('Fechting places failed, please again later'));
    }
    
    if (!userWithPlaces || userWithPlaces.places.length === 0) {
        return next(new HttpError('Could not find places for the user id.', 404));
    }
    
    return res.json({places: userWithPlaces.places.map(item => item.toObject({ getters: true })) });
};

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs', 422));
    }
    const { title, description, address } = req.body;
    
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
        image: req.file.path,
        creator: req.userData.userId
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

    if (place.creator.ToString() !== req.userData.userId) {
        next(new HttpError('You are not allowed to edit this place', 401));
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

    if (place.creator.id !== req.userData.userId) {
        return next(new HttpError('You are not allowed to edit this place', 401));
    }

    const imagePath = place.image;

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

    fs.unlink(imagePath, (err) => {
        if (err) {
            console.log('Error on deleting places image.')
        }
    });

    res.status(200).json({message: 'Deleted place'});
};


exports.createPlace = createPlace;
exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;
exports.updatePlaceById = updatePlaceById;
exports.deletePlace = deletePlace;
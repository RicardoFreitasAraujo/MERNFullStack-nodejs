const HttpError = require('../model/http-error');
const uuid = require('uuid/v4');
const { validationResult } = require('express-validator');
const getCoordsForAddress = require('../utils/location');
const Place = require('../model/place');

let DUMMY_PLACES = [
    {
        id: 'p1',
        title: 'Vila Belmiro',
        description: 'Oen of the most famous soccer statium',
        location: {
            lat:23.950049078012494 ,
            log:-46.33910346010528
        },
        addres: 'R. Antônio Malheiros Júnior, 42 - Vila Belmiro, Santos - SP, 11070-200',
        creator: 'u1'
    }
];

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

const getPlaceByUserId = (req, res, next) => {
    const userId = req.params.uid;
    const place = DUMMY_PLACES.filter(p => { return p.creator === userId });
   
    if (!place || place.length === 0) {
        return next(new HttpError('Could not find places for the user id.', 404));
    }

    return res.json({place});
};

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        next(new HttpError('Invalid inputs', 422));
    }
    const { title, description, address, creator } = req.body;
    
    let  coordinates; 
    try {
        coordinates = await getCoordsForAddress(address);
    }
    catch (error) {
        return next(error);
    }
    
    const createdPlaceObj = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: 'https://ibcdn.canaltech.com.br/8FplhVkDQdAatiUcehCimgkGJlI=/512x288/smart/i257652.jpeg',
        creator
    });
    
    try {
        await createdPlaceObj.save();
    } catch(err) {
        const error = new HttpError('Creating place failed',500);
        return next(error);
    }
    
    return res.status(201).json({place: createdPlaceObj});
};

const updatePlaceById = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new HttpError('Invalid inputs', 422);
    }

    const placeId = req.params.pid;
    const { title, description } = req.body;

    const updatedPlace = { ...DUMMY_PLACES.find(p => p.id === placeId) };
    const placeIndex = DUMMY_PLACES.findIndex(p => p.id === placeId);
    updatedPlace.title = title;
    updatedPlace.description = description;
    DUMMY_PLACES[placeIndex] = updatedPlace;
    res.status(200).json({place: updatedPlace});
};


const deletePlace = (req, res, next) => {
    const placeId = req.params.pid;
    if (!DUMMY_PLACES.find(p => p.id === placeId)) {
        throw new HttpError('Could not find a place with this id', 404);
    }
    DUMMY_PLACES = DUMMY_PLACES.filter(item => item.id !== placeId);
    res.status(200).json({message: 'Deleted place'});
};


exports.createPlace = createPlace;
exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;
exports.updatePlaceById = updatePlaceById;
exports.deletePlace = deletePlace;
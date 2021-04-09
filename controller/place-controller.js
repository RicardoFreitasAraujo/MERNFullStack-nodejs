const DUMMY_PLACES = [
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

const getPlaceById = (req, res, next) => {
    const placeId = req.params.pid;
    const place = DUMMY_PLACES.find(item => { return item.id === placeId; });
    
    if (!place) {
        return next(new HttpError('Could not find a place for the provided id.', 404));
    }

    return res.json({place: place});
}

const getPlaceByUserId = (req, res, next) => {
    const userId = req.params.uid;
    const place = DUMMY_PLACES.find(p => { return p.creator === userId });
   
    if (!place) {
        return next(new HttpError('Could not find a place for the user id.', 404));
    }

    return res.json({place});
};

exports.getPlaceById = getPlaceById;
exports.getPlaceByUserId = getPlaceByUserId;
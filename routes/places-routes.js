const express = require('express');

const router = express.Router();

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

router.get('/:pid',(req,res,next) => {
    console.log(req.params);
    const placeId = req.params.pid;
    const place = DUMMY_PLACES.find(item => { return item.id === placeId; });
    
    if (!place) {
        const error = new Error('Could not find a place for the provided id.');
        error.code = 404;
        return next(error);
    }

    return res.json({place: place});
});

router.get('/user/:uid/', (req, res, next) => {
    const userId = req.params.uid;
    const place = DUMMY_PLACES.find(p => { return p.creator === userId });
   
    if (!place) {
        const error = new Error('Could not find a place for the user id.');
        error.code = 404;
        return next(error);
    }

    return res.json({place});
});


module.exports = router;
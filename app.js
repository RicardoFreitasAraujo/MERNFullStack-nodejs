const express = require('express');

const placeRoutes = require('./routes/places-routes');

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}))


app.use('/api/places',placeRoutes);


app.use((error, req, res, next) =>{
    if (res.headerSent) {
        return next(error);
    }

    return res.status(error.code || 500)
               .json({message: error.message || 'An unknown error occurred!'});
});

app.listen(5000, () => {
   console.log('Server running in PORT 5000.');
});
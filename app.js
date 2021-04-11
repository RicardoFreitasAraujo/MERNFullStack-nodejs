const express = require('express');

const placeRoutes = require('./routes/places-routes');
const userRoutes = require('./routes/users-routes');
const HttpError  = require('./model/http-error');

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}))


app.use('/api/places',placeRoutes);
app.use('/api/users',userRoutes);

app.use((req, res, next) => {
    return next(new HttpError('Resource not found', 404));
});

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
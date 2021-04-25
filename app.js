const fs = require('fs');
const path = require('path');

const express = require('express');
const mongoose = require('mongoose');

const placeRoutes = require('./routes/places-routes');
const userRoutes = require('./routes/users-routes');
const HttpError  = require('./model/http-error');

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}))


  
//CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Headers','*');
    res.setHeader('Access-Control-Allow-Methods','*');
    next();
});


app.use('/uploads/images', express.static(path.join('uploads','images')));

app.use('/api/places',placeRoutes);
app.use('/api/users',userRoutes);

app.use((req, res, next) => {
    return next(new HttpError('Resource not found', 404));
});

app.use((error, req, res, next) => {

    //Rollback File
    if (req.file) {
        fs.unlink(req.file.path, (err) => {
            console.log('Error on removing file', err);
        });
    } 

      
    if (res.headerSent) {
        return next(error);
    }

    return res.status(error.code || 500)
               .json({message: error.message || 'An unknown error occurred!'});
});

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.osdel.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

console.log('Iniciando aplicação.');
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log('Connectado ao mongo.');
            app.listen(5000, () => { 
                console.log('Server running in PORT 5000.');
             }); 
        })
        .catch((err) => {
            console.log('Erro ao conectar no mongo.');
            console.log(err);
        });



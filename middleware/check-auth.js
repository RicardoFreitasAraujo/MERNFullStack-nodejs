const HttpError = require("../model/http-error");
const jwt = require('jsonwebtoken'); 

module.exports = (req, res, next) => {

    if (req.method === 'OPTIONS') {
        return next();
    }

    try {
        const token = req.headers.authorization.split(' ')[1]; 
        if (!token) {
            throw new HttpError('No token informed.', 401);
        }

        const decodedToken = jwt.verify(token, process.env.JWT_KEY);
        req.userData = { userId: decodedToken.userId };
        //Allow to continue
        return next();

    } catch (err) {
        return next(new HttpError('Authenticated failed, no token informed', 401));
    }
    
    
};
const HttpError = require('../model/http-error');
const uuid = require('uuid/v4');
const { validationResult } = require('express-validator');

const DUMMY_USERS = [
    {
        id: 'u1',
        name: 'Ricardo Freitas',
        email: 'ricarod@ricarod.com',
        password: '123'
    }
];

const getUsers = (req, res, next) => {
    return res.json({users: DUMMY_USERS});
};

const signup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new HttpError('Invalid inputs', 422);
    }
    const { name, email, password } = req.body;

    const hasUser = DUMMY_USERS.find(u => u.email === email);
    if (hasUser) {
        throw new HttpError('Email alreadey exists', 422);
    }

    const createUser = {
        id: uuid(),
        name,
        email, 
        password
    }
    DUMMY_USERS.push(createUser);
    return res.status(201).json({user: createUser});
}

const login = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new HttpError('Invalid inputs', 422);
    }
    const {email, password } = req.body;

    const identifiedUser = DUMMY_USERS.find(u => u.email === email);
    if (!identifiedUser || identifiedUser.password !== password) {
        throw new HttpError('Could not identify user.', 401);
    }

    return res.json({message: 'LoggedIn'});


    
}

exports.getUsers = getUsers; 
exports.signup = signup; 
exports.login = login;
const HttpError = require('../model/http-error');
const uuid = require('uuid/v4');
const { validationResult } = require('express-validator');
const User = require('../model/user');


const getUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find({}, '-password');
    } catch(err) {
        next(new HttpError('Error on list users'));
    }

    return res.json({users: users.map(user => user.toObject({getters: true}))});
    
};

const signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs', 422));
    }
    const { name, email, password } = req.body;

    let existingUser = null;
    try {
        existingUser = await User.findOne({ email: email});
    } 
    catch(err)
    {
        return next(new HttpError('Signing up failed, please try again later.'));
    }

    if (existingUser) {
        return next(new HttpError('User exists already, please login with another one'));
    }

    const createUser = new User({
        name,
        email,
        image: 'https://avatarfiles.alphacoders.com/667/thumb-66754.jpg',
        password,
        places: []
    });

    try
    {
        await createUser.save();
    }
    catch(err) {
        return next(new HttpError('Signup failed'));
    }
    
    return res.status(201).json({user: createUser.toObject({ getters: true })});
}

const login = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new HttpError('Invalid inputs', 422);
    }

    const {email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({email: email})
    } catch(err){
        return next(new HttpError('Loggin in failed'))
    }

    if (!existingUser || existingUser.password !== password) {
        return next(new HttpError('Invalid credentials, couldn not log in'), 401);
    }

    return res.json({message: 'LoggedIn'});
}

exports.getUsers = getUsers; 
exports.signup = signup; 
exports.login = login;
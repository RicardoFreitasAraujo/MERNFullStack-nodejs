const HttpError = require('../model/http-error');
const uuid = require('uuid/v4');
const { validationResult } = require('express-validator');
const User = require('../model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
    console.log('seu payload', req.body);
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

    let hashedPassword = null;
    try {
        hashedPassword = await bcrypt.hashSync(password, 12);
    } catch(err) {
        next(new HttpError('Could not create user, please try again.'));
    }
    

    const createUser = new User({
        name,
        email,
        image: req.file.path,
        password: hashedPassword,
        places: []
    });

    try
    {
        await createUser.save();
    }
    catch(err) {
        return next(new HttpError('Signup failed'));
    }

    let token;
    try 
    {
        token = jwt.sign({userId: createUser.id, email: createUser.email }, 
                        'supersecret_dont_share', {
                            expiresIn: '1h'
                        });
    }
    catch(err) {
        return next(new HttpError('Error on generating token'));
    }
    
    return res.status(201).json({
        userId: createUser.id,
        email: createUser.email,
        token: token
    });
}

const login = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs', 422));
    }

    const {email, password } = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({email: email})
    } catch(err){
        return next(new HttpError('Loggin in failed'));
    }

    if (!existingUser) {
        return next(new HttpError('Invalid credentials, couldn not log in'), 401);
    }

    let isValidPassword = false;
    try 
    {
        isValidPassword = await bcrypt.compare(password, existingUser.password)
    }
    catch (err) {
        return next(new HttpError('Couldn not log in'), 500);
    }

    if (!isValidPassword) {
        return next(new HttpError('Password is WRONG'), 401);
    }

    let token;
    try 
    {
        token = jwt.sign({userId: existingUser.id, email: existingUser.email }, 
                        'supersecret_dont_share', {
                        expiresIn: '1h'
                        });
    }
    catch(err) {
        return next(new HttpError('Error on generating token'));
    }

    return res.status(200).json({
        userId: existingUser.id,
        email: existingUser.email,
        token: token
    });
}

exports.getUsers = getUsers; 
exports.signup = signup; 
exports.login = login; 
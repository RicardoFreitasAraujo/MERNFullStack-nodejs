const moongose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = moongose.Schema;


const userSchema = new moongose.Schema({
    name: { type: String, required: true},
    email: { type: String, required: true, unique: true },
    password: {type: String, required: true, minlength: 6},
    image: { type: String, required: true },
    places: { type: String, required: true }
});

userSchema.plugin(uniqueValidator);

module.exports = moongose.model('User',userSchema);
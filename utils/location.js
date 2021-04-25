const axios = require('axios');
const HttpError = require('../model/http-error');

const API_KEY = process.env.GOOGLE_API_KEY;

getCoordsForAddress = async (address) => {
    
    return {
        lat: 0,
        lng:0
    };

    const response  = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`)
    const data = response.data;
    console.log(response);
    if (!data || data.status === 'ZERO_RESULTS') {
        const error = new HttpError('Could not find location in google maps', 422);
        throw error;
    }

    const coordinates = data.results[0].geometry.location;
    return coordinates;
}

module.exports = getCoordsForAddress;
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: false },
    // picture: { type: String, required: false },
    // fullname: { type: String, required: false },
    // auth: { type: String, enum: ['google', 'email'], required: true },
    // gender: { type: String, enum: ['male', 'female'], required: false },
    // birthDate: { type: Date, required: false},
    // height: { type: Number, required: false },
    // weight: { type: Number, required: false },
    // medicalHistory: { type: String, required: false },
    // phone: { type: Number, required: false },
    // location: { type: String, required: false },
    lastEmailVerification: { type: Number, required: true, default: 0 },
    isEmailVerified: { type: Boolean, required: true, default: false },
    isRegistered: { type: Boolean, required: true, default: false },
    isProfileCreated: { type: Boolean, required: true, default: false },
});

const User = mongoose.model("User", userSchema);

module.exports = {
    User
};
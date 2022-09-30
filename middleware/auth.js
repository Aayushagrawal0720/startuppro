const express = require('express');
const jwt = require('jsonwebtoken');
const startupScheme = require('../models/startupScheme');


const auth = async (req, res, next) => {
    try {
        if(!req.session.token){
            throw new Error('Invalid token');
        }
        const token = req.session.token;
        const decoded = jwt.verify(token, 'superisupar');
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!user) {
            throw new Error()
        }

        req.token = token
        req.user = user

        next()
    } catch (e) {
        res.redirect('/login');
    }
}

module.exports = auth;
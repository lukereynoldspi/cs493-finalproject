const express = require('express');
const jwtMiddleware = require('../jwtMiddleware');
const router = express.Router();
const userSchema = require('../models/user');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRATION_TIME } = require('../config');

exports.router = router;

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many requests from this IP, please try again in a minute'
});

router.post('/', limiter, jwtMiddleware, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const userData = req.body;
  const newUser = new userSchema(userData);
  newUser.save().then(() => {
    res.status(201).json({ id: newUser.userId});
  }).catch(err => {
    console.error(err);
    res.status(500).json({
      error: 'Error creating user'
    });
  });
});

router.post('/login', limiter, async (req, res) => {
  const { email, password } = req.body;
  try{
    const user = await userSchema.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email' });
    }
    const pwd = await userSchema.findOne({ password });
    if (!pwd) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    const token = jwt.sign({ email: user.email, role: user.role}, JWT_SECRET, JWT_EXPIRATION_TIME);
    res.status(200).json({ token: token, message: "Logged in"});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error logging in' });
  }
});

router.get('/:userId', limiter, jwtMiddleware, async (req, res) => {
  try {
    const user = await userSchema.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    if (user.role === 'student') {
      classes = await userSchema.aggregate([
        { $match: { userid: user.userId } },
        { $lookup: { from: 'courses', localField: 'userId', foreignField: 'instructor', as: 'teachingClasses'}},
        { $project: { _id: 0, teachingClasses: 1 } }
      ]);
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error getting user' });
  }
});
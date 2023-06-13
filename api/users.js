const express = require('express');
const jwtMiddleware = require('../jwtMiddleware');
const router = express.Router();
const userSchema = require('../models/user');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
exports.router = router;

router.post('/', (req, res) => {
  if (req.userSchema.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const userData = req.body;
  const newUser = new userSchema(userData);
  newUser.save().then(() => {
    res.status(201).json({ id: newUser.userid});
  }).catch(err => {
    console.error(err);
    res.status(500).json({
      error: 'Error creating user'
    });
  });
});

router.post('/login', jwtMiddleware, async (req, res) => {
  const { email, password } = req.body;
  try{
    const user = await userSchema.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRATION_TIME });
    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error logging in' });
  }
});

router.get('/:userId', jwtMiddleware, async (req, res) => {
  try {
    const user = await userSchema.findOne({ userid: req.params.userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (req.userSchema.role !== 'admin' && req.userSchema.userid !== user.userid) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error getting user' });
  }
});
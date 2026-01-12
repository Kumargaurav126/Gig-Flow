const express = require('express');
const { Gig } = require('../models'); 
const jwt = require('jsonwebtoken');
const router = express.Router();

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalid' });
    req.user = user;
    next();
  });
};

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const query = { status: 'open' };
    if (search) query.title = { $regex: search, $options: 'i' };
    
    const gigs = await Gig.find(query)
      .populate('ownerId', 'name')
      .sort({ createdAt: -1 });
      
    res.json(gigs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const gig = await Gig.create({ ...req.body, ownerId: req.user.id });
    res.status(201).json(gig);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', verifyToken, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id).populate('ownerId', 'name');
    res.json(gig);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
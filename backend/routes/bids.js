const express = require('express');
const mongoose = require('mongoose');
const { Bid, Gig } = require('../models'); 
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

router.post('/', verifyToken, async (req, res) => {
  try {
    const { gigId, message, price } = req.body;
    
    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ error: 'Gig not found' });
    if (gig.status !== 'open') return res.status(400).json({ error: 'Gig is closed for bidding' });

    const existingBid = await Bid.findOne({ gigId, freelancerId: req.user.id });
    if (existingBid) return res.status(400).json({ error: 'You have already placed a bid on this gig' });

    const bid = await Bid.create({
      gigId,
      freelancerId: req.user.id,
      message,
      price
    });
    res.status(201).json(bid);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:gigId', verifyToken, async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.gigId);
    if (!gig) return res.status(404).json({ error: 'Gig not found' });
    
    if (gig.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized: Only the gig owner can view bids' });
    }

    const bids = await Bid.find({ gigId: req.params.gigId })
      .populate('freelancerId', 'name email');
      
    res.json(bids);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:bidId/hire', verifyToken, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const bid = await Bid.findById(req.params.bidId).session(session);
    if (!bid) throw new Error('Bid not found');

    const gig = await Gig.findById(bid.gigId).session(session);
    
    if (gig.ownerId.toString() !== req.user.id) throw new Error('Unauthorized');
    if (gig.status !== 'open') throw new Error('Gig already assigned');

    gig.status = 'assigned';
    await gig.save({ session });

    bid.status = 'hired';
    await bid.save({ session });

    await Bid.updateMany(
      { gigId: gig._id, _id: { $ne: bid._id } },
      { status: 'rejected' }
    ).session(session);

    await session.commitTransaction();

    const io = req.app.get('io');
    const onlineUsers = req.app.get('onlineUsers');
    
    const freelancerSocketId = onlineUsers.get(bid.freelancerId.toString());

    if (freelancerSocketId) {
      io.to(freelancerSocketId).emit('notification', {
        message: `You have been hired for "${gig.title}"!`
      });
    }

    res.json({ message: 'Hired successfully' });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ error: err.message });
  } finally {
    session.endSession();
  }
});

module.exports = router;  
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const gigSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: Number, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['open', 'assigned'], default: 'open' },
}, { timestamps: true });

const bidSchema = new mongoose.Schema({
  gigId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'hired', 'rejected'], default: 'pending' },
}, { timestamps: true });

module.exports = {
  User: mongoose.model('User', userSchema),
  Gig: mongoose.model('Gig', gigSchema),
  Bid: mongoose.model('Bid', bidSchema),
};
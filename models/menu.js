const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  calories: { type: Number, required: true },
  rating: { type: Number, min: 1, max: 5, default: 3 },
  reviews: [{ user: String, review: String }] 
});

const menuSchema = new mongoose.Schema({
  date: { 
    type: Date, 
    required: true, 
    unique: true, 
    default: () => new Date().setHours(0, 0, 0, 0) 
  },
  breakfast: [itemSchema], 
  lunch: [itemSchema], 
  dinner: [itemSchema]
});

const Menu = mongoose.model('Menu', menuSchema);

module.exports = Menu;

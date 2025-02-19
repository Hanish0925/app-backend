const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const validRoles = ['user', 'admin'];

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: validRoles, 
    default: 'user', 
  },
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.statics.isValidRole = function (role) {
  return validRoles.includes(role);
};


const User = mongoose.model('User', userSchema);

module.exports = User;
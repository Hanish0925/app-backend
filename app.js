require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const user = require('./models/user');
const port = process.env.PORT || 3000;
const userRoutes = require('./routes/users');
const menuRoutes = require('./routes/menuRoutes');
app.use(express.json());
app.use((req, res, next) => {
  console.log('Incoming Request:', req.method, req.url);
  if (req.method !== 'GET') {
    console.log('Request Body:', req.body); 
  }
  next();
});
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('Connected to MongoDB');
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch(error => {
  console.log('Error connecting to MongoDB');
  console.log(error);
});
app.use('/api/users', userRoutes);
app.use('/api/menu', menuRoutes);

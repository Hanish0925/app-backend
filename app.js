require('dotenv').config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const user = require('./models/user');
const port = process.env.PORT || 3000;


app.use(express.json());

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

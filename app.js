require('dotenv').config();
const express = require('express');
const http = require('http');  
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userRoutes = require('./routes/users');
const menuRoutes = require('./routes/menuRoutes');
const { initWebSocket } = require("./socket");

const app = express();
const server = http.createServer(app); 
const port = process.env.PORT || 3000;

app.use(express.json());
app.use((req, res, next) => {
  console.log('Incoming Request:', req.method, req.url);
  if (req.method !== 'GET') {
    console.log('Request Body:', req.body); 
  }
  next();
});

initWebSocket(server); 

app.use('/api/users', userRoutes);
app.use('/api/menu', menuRoutes);

app.get("/", (req, res) => {
  res.send("Server is running...");
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(port, () => {  
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch(error => {
    console.log('Error connecting to MongoDB:', error);
  });

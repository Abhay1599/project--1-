/********************************************************************************* 
 * * ITE5315 – Project 
 * * I declare that this assignment is my own work in accordance with Humber Academic Policy. 
 * * No part of this assignment has been copied manually or electronically from any other source 
 * * (including web sites) or distributed to other students. 
 * * * Group member Name: ABHAY & Prarabdha Student IDs: N01581911 & N01578947 Date: 16th April 2024 
 * *********************************************************************************/
//IMPORTING MODULES
require("dotenv").config();
require("./models/user");
require("./models/movies");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const movieRoutes = require("./routes/movieRoutes");
const requireAuth = require("./middleware/requiredToken");
const cors = require("cors");


const app = express();

//Middleware for allowing cross-origin HTTP requests
app.use(cors())

// Middleware for parsing JSON requests
app.use(bodyParser.json());

// Registering authentication routes
app.use(authRoutes);

// Registering movie routes
app.use(movieRoutes);


// Connecting to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
let db = mongoose.connection;

// Event handler for successful MongoDB connection
db.once("open", function () {
  console.log("Connected to MongoDB");
});

// Event handler for MongoDB connection error
db.on("error", function (err) {
  console.log("DB Error");
});

// Starting the server
app.listen(3000, () => {
  console.log("listening on port  3000");
});

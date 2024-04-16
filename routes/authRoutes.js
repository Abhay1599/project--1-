// /********************************************************************************* 
//  * * ITE5315 – Project 
//  * * I declare that this assignment is my own work in accordance with Humber Academic Policy. 
//  * * No part of this assignment has been copied manually or electronically from any other source 
//  * * (including web sites) or distributed to other students. 
//  * * * Group member Name: ABHAY & Prarabdha Student IDs: N01581911 & N01578947 Date: 16th April 2024 
//  * *********************************************************************************/
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = mongoose.model("User");
const router = express.Router();

/*
@type     -   POST
@route    -   /signup
@desc     -   Endpoint to singup with a new email and password
@access   -   public
*/
router.post("/signup", async (req, res) => {
  const { email, name ,password } = req.body;

  try {
    const user = new User({ email, password, name });
    await user.save();

    const token = jwt.sign({ userId: user._id }, "MY_SECRET_KEY");
    res.send({ token });
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

/*
@type     -   POST
@route    -   /signup
@desc     -   Endpoint to sigin with an existing email and password
@access   -   public
*/
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).send({ error: "Must provide email and password" });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).send({ error: "Invalid email or password" });
  }
  try {
    await user.comparePassword(password);
    const token = jwt.sign({ userId: user._id }, "MY_SECRET_KEY");
    res.send({ token });
  } catch (err) {
    res.status(404).send({ error: "Invalid password" });
  }
});

module.exports = router;
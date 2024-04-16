/********************************************************************************* 
 * * ITE5315 – Project 
 * * I declare that this assignment is my own work in accordance with Humber Academic Policy. 
 * * No part of this assignment has been copied manually or electronically from any other source 
 * * (including web sites) or distributed to other students. 
 * * * Group member Name: ABHAY & Prarabdha Student IDs: N01581911 & N01578947 Date: 16th April 2024 
 * *********************************************************************************/
const checkUserExist = (req, res, next) => {
    if (!req.user) {
      return res.status(404).send({ error: "User does not exist anymore." });
    }
    next();
  };
  
module.exports = checkUserExist;
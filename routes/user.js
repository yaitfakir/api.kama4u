const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const logger = require("../utils/logger");
const User = require("../models/User");

router.post("/update", async (req, res) => {
  try {
    const { usid } = req.user;
    const { userObject } = req.body;
    let id = mongoose.Types.ObjectId(usid);

    await User.findOneAndUpdate(
      { _id: id },
      {
        firstName: userObject.firstName,
        lastName: userObject.lastName,
        email: userObject.email,
        phone: userObject.phone,
      }
    );

    return res.status(200).json({ message: "User successfully Updated." });
  } catch (err) {
    await logger(req, "Error", err);
    console.log("An error occured");
    console.log(err);
    return res.status(500).json("An error occured");
  }
});

module.exports = router;

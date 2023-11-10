const express = require("express");
const router = express.Router();
const logger = require("../utils/logger");
const User = require("../models/User");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const verifyToken = require("./auth");

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

router.get("/", async (req, res) => {
  try {
    const { usid } = req.user;
    let id = mongoose.Types.ObjectId(usid);

    let user = await User.findOne(
      { _id: id },
      { firstName: 1, lastName: 1, email: 1, phone: 1, role: 1 }
    );

    return res.status(200).json(user);
  } catch (err) {
    await logger(req, "Error", err);
    console.log("An error occured");
    console.log(err);
    return res.status(500).json("An error occured");
  }
});

router.post("/password-reset", verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const { usid } = req.user;

    const user = await User.findById({ _id: usid });
    if (!user) return res.status(400).json("User not found !!!");

    let passMatch = await bcrypt.compare(oldPassword, user.password);
    console.log("pass match", passMatch);
    if (passMatch) {
      user.password = await bcrypt.hash(newPassword, 10);
      user.save();
      return res.status(200).json("password reset sucessfully.");
    }
    return res.status(500).json("password doesn't match.");
  } catch (err) {
    await logger(req, "Error", err);

    console.log("An error occured");
    console.log(err);
    return res.status(500).json("An error occured");
  }
});

module.exports = router;

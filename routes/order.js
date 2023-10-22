const express = require("express");
const router = express.Router();
const logger = require("../utils/logger");
const Order = require("../models/Order");
const mongoose = require("mongoose");

router.post("/add", async (req, res) => {
  try {
    const { usid, role } = req.user;
    const {
      server,
      characterName,
      paymentMethod,
      paymentInfo,
      quantity,
      fullName,
      codeForExchange,
      description,
      type,
    } = req.body;

    //verification inputs

    const order = await Order.create({
      server: server,
      characterName: characterName,
      paymentMethod: paymentMethod, // sanitize: convert email to lowercase
      paymentInfo: paymentInfo,
      quantity: quantity,
      fullName: fullName,
      codeForExchange: codeForExchange,
      description: description,
      status: process.env.PENDING,
      owner: usid,
      type: type,
    });

    return res.status(201).json({ message: order });
  } catch (err) {
    await logger(req, "Error", err);
    console.log(err);
    return res.status(500).json("An error occured");
  }
});

router.post("/list", async (req, res) => {
  try {
    var { usid, role } = req.user;
    var { paginator, filter } = req.body;
    let id = mongoose.Types.ObjectId(usid);

    filter = { ...filter, owner: id };
    const pipline = [
      {
        $match: filter,
      },
      {
        $sort: {
          _id: -1,
        },
      },
      {
        $skip: paginator?.skip || 0,
      },
      {
        $limit: paginator?.limit || 10,
      },
    ];
    const data = await Order.aggregate(pipline);
    const count = await Order.countDocuments(filter);

    var result = {
      count: count,
      data: data,
    };
    if (result) {
      return res.status(200).json(result);
    } else {
      return res.status(403).json("No Order found !!!");
    }
  } catch (err) {
    await logger(req, "Error", err);
    console.log(err);
    return res.status(500).json("An error occured");
  }
});

router.post("/action", async (req, res) => {
  try {
    const { role } = req.user;
    const { idOrder, action } = req.body;
    let id = mongoose.Types.ObjectId(idOrder);

    if (role != process.env.SUP_ADMIN) {
      return res.status(403).json({
        error: "You don't have the permission to performe this action",
      });
    }

    const order = await Order.findOneAndUpdate(
      { _id: id },
      {
        status: action,
        $push: { actions: { action: action } },
      }
    );

    return res.status(200).json({ message: order });
  } catch (err) {
    await logger(req, "Error", err);
    console.log(err);
    return res.status(500).json("An error occured");
  }
});
module.exports = router;

const express = require("express");
const router = express.Router();
const logger = require("../utils/logger");
const Order = require("../models/Order");
const mongoose = require("mongoose");
const User = require("../models/User");

router.post("/list", async (req, res) => {
  try {
    var { usid, role } = req.user;
    var { paginator, filter } = req.body;
    let id = mongoose.Types.ObjectId(usid);

    filter = { ...filter };
    if (filter)
      Object.keys(filter).forEach((key) => {
        if (filter[key] == null) {
          delete filter[key];
        }
      });

    let isAdmin = role == process.env.SUP_ADMIN;
    if (!isAdmin) {
      filter = { ...filter, owner: id };
    }

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
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      {
        $project: {
          __v: 0,
          owner: { confirmed: 0, password: 0, createdAt: 0, __v: 0, role: 0 },
        },
      },
    ];

    const data = await Order.aggregate(pipline);
    const count = await Order.countDocuments(filter);

    if (isAdmin) {
      data.forEach((e) => {
        const existAction = e?.status;
        let PossibleAction = GetPossibleActions(existAction);
        e.PossibleAction = PossibleAction;
        e.owner = e.owner[0];
      });
    }
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

router.post("/sell", async (req, res) => {
  try {
    const { usid, role } = req.user;
    const {
      server,
      characterName,
      paymentMethod,
      paymentInfo,
      quantity,
      currency,
      pricePerOne,
      fullName,
      description,
    } = req.body;

    const order = await Order.create({
      server: server,
      characterName: characterName,
      paymentMethod: paymentMethod,
      paymentInfo: paymentInfo,
      quantity: quantity,
      fullName: fullName,
      description: description,
      status: process.env.PENDING,
      actions: [{ action: "Pending" }],
      owner: usid,
      type: process.env.SELL,
      pricePerOne: pricePerOne,
      totalToBePaid: pricePerOne * quantity,
      currency: currency,
    });

    return res.status(201).json({ message: order });
  } catch (err) {
    await logger(req, "Error", err);
    console.log(err);
    return res.status(500).json("An error occured");
  }
});

router.post("/buy", async (req, res) => {
  try {
    const { usid, role } = req.user;
    const {
      server,
      characterName,
      paymentMethod,
      paymentInfo,
      quantity,
      fullName,
      currency,
      description,
      pricePerOne,
    } = req.body;

    const order = await Order.create({
      server: server,
      characterName: characterName,
      paymentMethod: paymentMethod,
      paymentInfo: paymentInfo,
      quantity: quantity,
      fullName: fullName,
      description: description,
      status: process.env.PENDING,
      actions: [{ action: "Pending" }],
      owner: usid,
      type: process.env.BUY,
      pricePerOne: pricePerOne,
      totalToBePaid: pricePerOne * quantity,
      currency: currency,
    });

    return res.status(201).json({ message: order });
  } catch (err) {
    await logger(req, "Error", err);
    console.log(err);
    return res.status(500).json("An error occured");
  }
});

router.post("/checkout", async (req, res) => {
  try {
    const { usid, role } = req.user;
    const { idOrder } = req.body;
    let id = mongoose.Types.ObjectId(idOrder);

    const order = await Order.findOne({ _id: id });

    if (order)
      return res
        .status(201)
        .json({ message: "Next feature => Payment Process" });
    return res.status(404).json({ message: "Order Not Found !!!" });
  } catch (err) {
    await logger(req, "Error", err);
    console.log(err);
    return res.status(500).json("An error occured");
  }
});

router.post("/action", async (req, res) => {
  try {
    const { role } = req.user;
    var { idOrder, action, motif } = req.body;
    let id = mongoose.Types.ObjectId(idOrder);
    action = action.toLowerCase();

    if (role != process.env.SUP_ADMIN) {
      return res.status(403).json({
        error: "You don't have the permission to performe this action",
      });
    }
    const existOrder = await Order.findOne({ _id: id });
    if (!existOrder) {
      return res.status(404).json({
        error: "Order Doesn't Exist !!!",
      });
    }

    if (["issue", "refund"].includes(action) && !motif) {
      return res.status(400).json({
        error: "You should insert a Motif !!!",
      });
    }
    const existAction = existOrder?.status;

    let possibleAction = GetPossibleActions(existAction);
    let shouldAction = possibleAction.includes(action);
    if (shouldAction) {
      existOrder.status = action;
      existOrder.actions.push({ action, motif });
      existOrder.save();
    } else
      return res.status(404).json({
        error: "Action not Possible !!!",
      });

    return res.status(200).json({ message: existOrder });
  } catch (err) {
    await logger(req, "Error", err);
    console.log(err);
    return res.status(500).json("An error occured");
  }
});

router.get("/action/cancel/:id_order", async (req, res) => {
  try {
    const { usid } = req.user;
    const { id_order } = req.params;
    let idUser = mongoose.Types.ObjectId(usid);
    let idOrder = mongoose.Types.ObjectId(id_order);

    const existOrder = await Order.findOne({ _id: idOrder, owner: idUser });
    if (!existOrder) {
      return res.status(404).json({
        error: "Order Doesn't Exist !!!",
      });
    }

    const existAction = existOrder?.status;
    const action = process.env.CANCELED;
    let shouldAction = GetPossibleActions(existAction)?.includes(action);

    if (shouldAction) {
      existOrder.status = action;
      existOrder.actions.push({ action, motif: "Canceled by client" });
      existOrder.save();
    } else
      return res.status(404).json({
        error: "Action not Possible !!!",
      });

    return res
      .status(200)
      .json({ message: { _id: existOrder._id, status: existOrder.status } });
  } catch (err) {
    await logger(req, "Error", err);
    console.log(err);
    return res.status(500).json("An error occured");
  }
});

router.post("/comment/add/:id_order", async (req, res) => {
  try {
    const { usid, role } = req.user;
    const { id_order } = req.params;
    const { comment } = req.body;
    let idUser = mongoose.Types.ObjectId(usid);
    let idOrder = mongoose.Types.ObjectId(id_order);

    const _user = await User.findOne({ _id: idUser });
    const existOrder = await Order.findOne({ _id: idOrder });
    if (!existOrder) {
      return res.status(404).json({
        error: "Order Doesn't Exist !!!",
      });
    }

    existOrder.comments.push({
      comment,
      owner:
        role == process.env.SUP_ADMIN
          ? "Kamas4u Support"
          : _user.firstName + " " + _user.lastName,
    });
    existOrder.save();

    return res.status(200).json(existOrder);
  } catch (err) {
    await logger(req, "Error", err);
    console.log(err);
    return res.status(500).json("An error occured");
  }
});

function GetPossibleActions(action) {
  switch (action) {
    case "pending":
      return ["accepted", "canceled"];
    case "accepted":
      return ["paid", "canceled"];
    case "canceled":
      return ["issue", "refund"];
    default:
      break;
  }
  return [];
}
module.exports = router;

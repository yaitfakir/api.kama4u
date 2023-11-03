const express = require("express");
const router = express.Router();
const logger = require("../utils/logger");

const Order = require("../models/Order");

router.get("/dash", async (req, res) => {
  try {
    // const { periode } = req.body;

    // Barchart Filter
    // const marketFilter = !market ? {} : { market: market };

    //Pipline
    // const pipelineChart = [
    //   {
    //     $match: marketFilter,
    //   },
    //   { $sort: { _id: -1 } },
    //   { $limit: periode },
    // ];

    //Projection
    const orders = await Order.find({});
    let pending = orders.filter((f) => f.status == process.env.PENDING)?.length;
    let paid = orders.filter((f) => f.status == process.env.PAID)?.length;
    let cancled = orders.filter(
      (f) =>
        f.status ==
        (process.env.CANCLED || process.env.ISSUE || process.env.REFUND)
    )?.length;
    let outMontant = orders.filter(
      (f) => f.type == process.env.BUY && f.status == process.env.PAID
    )?.length;
    let inMontant = orders.filter(
      (f) => f.type == process.env.SELL && f.status == process.env.PAID
    )?.length;
    const resp = {
      total: orders?.length,
      pending: pending,
      paid: paid,
      cancled: cancled,
      outMontant: outMontant,
      inMontant: inMontant,
    };

    return res.status(200).json(resp);
  } catch (err) {
    await logger(req, "Error", err);
    console.log("An error occured");
    console.log(err);
    return res.status(500).json("An error occured");
  }
});

router.get("/transaction-stats", async (req, res) => {
  try {
    // const { periode, associateId, zone } = req.body;
    const pipeline = [
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ];
    const post = await Post.aggregate(pipeline);

    return res.status(200).json(post);
  } catch (err) {
    await logger(req, "Error", err);
    console.log("An error occured");
    console.log(err);
    return res.status(500).json("An error occured");
  }
});

module.exports = router;

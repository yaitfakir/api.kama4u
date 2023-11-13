const express = require("express");
const router = express.Router();
const logger = require("../utils/logger");

const Order = require("../models/Order");

router.post("/dash", async (req, res) => {
  try {
    // const { periode } = req.body;

    // Barchart Filter
    // const marketFilter = !market ? {} : { market: market };

    const pipelineChart = [
      // {
      //   $match: marketFilter,
      // },
      {
        $facet: {
          total: [{ $count: "total" }],
          pending: [
            { $match: { status: process.env.PENDING } },
            { $count: "pending" },
          ],
          paid: [{ $match: { status: process.env.PAID } }, { $count: "paid" }],
          canceled: [
            {
              $match: {
                status:
                  process.env.CANCELED ||
                  process.env.ISSUE ||
                  process.env.REFUND,
              },
            },
            { $count: "canceled" },
          ],
          purchase: [
            {
              $match: {
                type: process.env.BUY,
                status: process.env.PAID,
              },
            },
            { $count: "buy" },
          ],

          sell: [
            {
              $match: {
                type: process.env.SELL,
                status: process.env.PAID,
              },
            },
            { $count: "sell" },
          ],
        },
      },

      {
        $project: {
          total: { $arrayElemAt: ["$total.total", 0] },
          pending: { $arrayElemAt: ["$pending.pending", 0] },
          paid: { $arrayElemAt: ["$paid.paid", 0] },
          canceled: { $arrayElemAt: ["$canceled.canceled", 0] },
          purchase: { $arrayElemAt: ["$purchase.buy", 0] },
          sale: { $arrayElemAt: ["$sell.sell", 0] },
        },
      },
    ];

    const orders = await Order.aggregate(pipelineChart);

    return res.status(200).json(orders[0]);
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
    const post = await Order.aggregate(pipeline);

    return res.status(200).json(post);
  } catch (err) {
    await logger(req, "Error", err);
    console.log("An error occured");
    console.log(err);
    return res.status(500).json("An error occured");
  }
});

module.exports = router;

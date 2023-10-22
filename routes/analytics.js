const express = require("express");
const router = express.Router();
const logger = require("../utils/logger");

const Post = require("../models/Post");

router.post("/dash", async (req, res) => {
  try {
    const { periode, market } = req.body;

    // Barchart Filter
    const marketFilter = !market ? {} : { market: market };

    //Pipline
    const pipelineChart = [
      {
        $match: marketFilter,
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: periode },
    ];

    //Projection
    const barchart = await Post.aggregate(pipelineChart);
    const totalPosts = barchart.reduce((acc, curr) => acc + curr.count, 0);
    const marketCount = await Post.distinct("market");

    const response = {
      totalPosts: totalPosts,
      marketCount: marketCount.length,
      barchart: barchart,
    };
    return res.status(200).json(response);
  } catch (err) {
    await logger(req, "Error", err);
    console.log("An error occured");
    console.log(err);
    return res.status(500).json("An error occured");
  }
});

router.get("/market-stats", async (req, res) => {
  try {
    // const { periode, associateId, zone } = req.body;
    const pipeline = [
      {
        $group: {
          _id: "$market.store",
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

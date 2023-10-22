const express = require("express");
const router = express.Router();
const logger = require("../utils/logger");

const Log = require("../models/Log");

router.post("/all", async (req, res) => {
  try {
    const { role } = req.user;
    var { paginator, filter } = req.body;

    //  // Todo : should be SUP_ADMIN
    if (role != process.env.ADMIN && role != process.env.SUP_ADMIN)
      return res
        .status(403)
        .json("You don't have permission to perform this action");

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
    const data = await Log.aggregate(pipline);
    const count = await Log.countDocuments(filter);

    var result = {
      count: count,
      data: data,
    };
    if (result) {
      return res.status(200).json(result);
    } else {
      return res.status(403).json("No log found !");
    }
  } catch (err) {
    await logger(req, "Error", err);
    console.log("An error occured");
    console.log(err);
    return res.status(500).json("An error occured");
  }
});

router.post("/assign/:id_log", async (req, res) => {
  try {
    const { role } = req.user;
    const { id_log } = req.params;
    const { user } = req.body;

    //  // Todo : should be SUP_ADMIN
    if (role != process.env.ADMIN && role != process.env.SUP_ADMIN)
      return res
        .status(403)
        .json("You don't have permission to perform this action");

    if (!(id_log && user)) {
      return res.status(409).json("user and idLog is required !!!");
    }

    const _log = await Log.findByIdAndUpdate(
      { _id: id_log },
      { assinedTo: user }
    );

    if (_log) {
      return res.status(200).json(_log);
    } else {
      return res.status(403).json("No user id found !");
    }
  } catch (err) {
    await logger(req, "Error", err);

    console.log("An error occured");
    console.log(err);
    return res.status(500).json("An error occured");
  }
});

router.post("/action/:id_log", async (req, res) => {
  // Our register logic starts here
  try {
    const { role } = req.user;
    const { id_log } = req.params;
    const { action } = req.body;

    // Todo : should be SUP_ADMIN
    if (role != process.env.ADMIN && role != process.env.SUP_ADMIN)
      return res
        .status(403)
        .json("You don't have permission to perform this action");

    // Validate user input
    if (!(id_log && action)) {
      return res.status(400).json("All input is required");
    }

    const log = await Log.findByIdAndUpdate(
      { _id: id_log },
      { status: action }
    );

    if (log) {
      return res.status(200).json(log);
    } else {
      return res.status(403).json("No post found !");
    }
  } catch (err) {
    await logger(req, "Error", err);

    console.log("An error occured");
    console.log(err);
    return res.status(500).json("An error occured");
  }
});

module.exports = router;

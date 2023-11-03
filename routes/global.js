const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const logger = require("../utils/logger");
const seeds = require("../utils/seeds");
const rates = require("../utils/rates");
const verifyToken = require("../middleware/auth");

router.get("/servers", async (req, res) => {
  try {
    var result = seeds.servers.option;
    if (result) {
      return res.status(200).json(result);
    } else {
      return res.status(403).json("No servers id found !");
    }
  } catch (err) {
    await logger(req, "Error", err);
    console.log(err);
    return res.status(500).json("An error occured");
  }
});

router.get("/payment", async (req, res) => {
  try {
    var result = seeds.payment.option;
    if (result) {
      return res.status(200).json(result);
    } else {
      return res.status(403).json("No servers id found !");
    }
  } catch (err) {
    await logger(req, "Error", err);
    console.log(err);
    return res.status(500).json("An error occured");
  }
});

router.get("/actions", verifyToken, async (req, res) => {
  try {
    const { role } = req?.user || "";

    if (role != process.env.SUP_ADMIN) {
      return res.status(403).json({
        error: "You don't have the permission to performe this action",
      });
    }

    var result = seeds.actions.option;
    if (result) {
      return res.status(200).json(result);
    } else {
      return res.status(403).json("No servers id found !");
    }
  } catch (err) {
    await logger(req, "Error", err);
    console.log(err);
    return res.status(500).json("An error occured");
  }
});

router.get("/rates/:type", async (req, res) => {
  try {
    const { type } = req.params;
    if (!type) return res.status(400).json("type undefined !");

    var result;
    if (type == "sell") {
      result = {
        DofusKamas: rates.VendreDofusKamas,
        DofusTouchKamas: rates.VendreDofusTouchKamas,
      };
    }
    if (type === "buy") {
      result = {
        DofusKamas: rates.AcheterDofusKamas,
        DofusTouchKamas: rates.AcheterDofusTouchKamas,
      };
    }
    if (result) {
      return res.status(200).json(result);
    } else {
      return res.status(403).json("No servers id found !");
    }
  } catch (err) {
    await logger(req, "Error", err);
    console.log(err);
    return res.status(500).json("An error occured");
  }
});

module.exports = router;

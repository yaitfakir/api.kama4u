const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const logger = require("../utils/logger");
const seeds = require("../utils/seeds");
const Rate = require("../models/Rate");
const PaymentMethod = require("../models/PaymentMethod");
const verifyToken = require("../middleware/auth");

router.get("/servers", async (req, res) => {
  try {
    var result = seeds.servers;
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
    // const { role } = req.user;

    var result = await PaymentMethod.find(
      { etat: true },
      { _id: 1, name: 1, addPrice: 1, percentage: 1 }
    );

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

router.get("/paymentAdmin", verifyToken, async (req, res) => {
  try {
    const { role } = req.user;

    if (role != process.env.SUP_ADMIN) {
      return res.status(403).json({
        error: "You don't have the permission to performe this action",
      });
    }

    var result = await PaymentMethod.find(
      {},
      { _id: 1, name: 1, addPrice: 1, percentage: 1, etat: 1 }
    );

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
    if (!type) return res.status(400).json("Type Undefined !!!");

    // var result = [
    //   ...rates.VendreDofusKamas.map((f) => ({
    //     ...f,
    //     sort: "DofusKamas",
    //     type: "sell",
    //   })),
    //   ...rates.VendreDofusTouchKamas.map((f) => ({
    //     ...f,
    //     sort: "DofusTouchKamas",
    //     type: "sell",
    //   })),

    //   ...rates.AcheterDofusKamas.map((f) => ({
    //     ...f,
    //     sort: "DofusKamas",
    //     type: "buy",
    //   })),
    //   ...rates.AcheterDofusTouchKamas.map((f) => ({
    //     ...f,
    //     sort: "DofusTouchKamas",
    //     type: "buy",
    //   })),
    // ];
    // await Rate.create(result);

    let rates = await Rate.find({ type: type });
    var result = {
      DofusKamas: rates.filter((f) => f.sort == "DofusKamas"),
      DofusTouchKamas: rates.filter((f) => f.sort == "DofusTouchKamas"),
    };
    if (result) {
      return res.status(200).json(result);
    } else {
      return res.status(403).json("No rates id found !");
    }
  } catch (err) {
    await logger(req, "Error", err);
    console.log(err);
    return res.status(500).json("An error occured");
  }
});

router.get("/actions", verifyToken, async (req, res) => {
  try {
    const { role } = req.user;

    if (role != process.env.SUP_ADMIN) {
      return res.status(403).json({
        error: "You don't have the permission to performe this action",
      });
    }

    var result = seeds.actions;
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

router.post("/rates/update/:id", verifyToken, async (req, res) => {
  try {
    const { role } = req.user;
    var { prixDh, prixEur, etat, prixUsd } = req.body;
    var { id } = req.params;

    id = mongoose.Types.ObjectId(id);

    if (role != process.env.SUP_ADMIN) {
      return res.status(403).json({
        error: "You don't have the permission to performe this action !!!",
      });
    }

    var result = await Rate.findOneAndUpdate(
      { _id: id },
      {
        prixEur: prixEur,
        prixDh: prixDh,
        prixUsd: prixUsd,
      }
    );
    if (result) {
      return res.status(200).json({
        _id: result._id,
        serveur: result.serveur,
        sort: result.sort,
        type: result.type,
        prixEur: prixEur,
        prixDh: prixDh,
        prixUsd: prixUsd,
        etat: etat,
      });
    } else {
      return res.status(403).json("No servers id found !");
    }
  } catch (err) {
    await logger(req, "Error", err);
    console.log(err);
    return res.status(500).json("An error occured");
  }
});

router.post("/payment/update/:id", verifyToken, async (req, res) => {
  try {
    const { role } = req.user;
    var { addPrice, percentage, etat } = req.body;
    var { id } = req.params;

    id = mongoose.Types.ObjectId(id);

    if (role != process.env.SUP_ADMIN) {
      return res.status(403).json({
        error: "You don't have the permission to performe this action !!!",
      });
    }

    var result = await PaymentMethod.findOneAndUpdate(
      { _id: id },
      {
        addPrice: addPrice,
        percentage: percentage,
      }
    );
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

router.get("/rates/active/:id", verifyToken, async (req, res) => {
  try {
    const { role } = req.user;
    var { id } = req.params;

    id = mongoose.Types.ObjectId(id);

    if (role != process.env.SUP_ADMIN) {
      return res.status(403).json({
        error: "You don't have the permission to performe this action !!!",
      });
    }

    var rate = await Rate.findById({ _id: id });

    if (rate) {
      rate.etat = !rate.etat;
      rate.save();
      return res.status(200).json(rate);
    } else {
      return res.status(409).json("Error");
    }
  } catch (err) {
    await logger(req, "Error", err);
    console.log(err);
    return res.status(500).json("An error occured");
  }
});

router.get("/payment/active/:id", verifyToken, async (req, res) => {
  try {
    const { role } = req.user;
    var { id } = req.params;

    id = mongoose.Types.ObjectId(id);

    if (role != process.env.SUP_ADMIN) {
      return res.status(403).json({
        error: "You don't have the permission to performe this action !!!",
      });
    }

    var payment = await PaymentMethod.findById({ _id: id });

    if (payment) {
      payment.etat = !payment.etat;
      payment.save();
      return res.status(200).json(payment);
    } else {
      return res.status(409).json("Error");
    }
  } catch (err) {
    await logger(req, "Error", err);
    console.log(err);
    return res.status(500).json("An error occured");
  }
});

module.exports = router;

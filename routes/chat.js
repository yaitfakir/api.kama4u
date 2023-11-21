const express = require("express");
const router = express.Router();
const logger = require("../utils/logger");
const mongoose = require("mongoose");
const Chat = require("../models/Chat");
const myCache = require("../utils/cache");
const User = require("../models/User");

router.get("/messages", async (req, res) => {
  try {
    var { usid, role } = req.user;
    // var { filter, paginator } = req.body;
    let idUser = mongoose.Types.ObjectId(usid);

    if (role != process.env.SUP_ADMIN)
      return res
        .status(403)
        .json("you don't have the permission to attend this action");

    // const chats = await Chat.find().populate("client");
    // console.log("chats", chats);
    // let isAdmin = role == process.env.SUP_ADMIN;
    // if (!isAdmin) {
    //   filter = { ...filter, owner: id };
    // }

    const pipline = [
      {
        // $match: filter,
        $match: {},
      },

      // {
      //   $skip: paginator?.skip || 0,
      // },
      // {
      //   $limit: paginator?.limit || 10,
      // },
      {
        $lookup: {
          from: "users",
          localField: "client",
          foreignField: "_id",
          as: "clientArray",
        },
      },
      {
        $set: {
          client: { $arrayElemAt: ["$clientArray", 0] },
        },
      },
      {
        $project: {
          unreadMessagesCount: {
            $size: {
              $filter: {
                input: "$message",
                as: "msg",
                cond: { $eq: ["$$msg.isRead", false] },
              },
            },
          },
          client: {
            _id: 1,
            name: { $concat: ["$client.firstName", " ", "$client.lastName"] },
            email: "$client.email",
            // role: "$client.role",
          },
        },
      },
    ];

    const data = await Chat.aggregate(pipline);

    return res.status(200).json(data);
  } catch (err) {
    await logger(req, "Error", err);
    console.log("An error occured");
    console.log(err);
    return res.status(500).json("An error occured");
  }
});

router.get("/messages/:idChat", async (req, res) => {
  try {
    var { usid, role } = req.user;
    var { idChat } = req.params;
    let _idChat = mongoose.Types.ObjectId(idChat);

    if (role != process.env.SUP_ADMIN)
      return res
        .status(403)
        .json("you don't have the permission to attend this action");

    const chat = await Chat.findOne({ _id: _idChat }).populate("client");
    chat.message.map((m) => (m.isRead = true));
    await chat.save();
    const unreadMessagesCount = chat.message.filter((m) => !m.isRead).length;

    // Prepare the result object
    const result = {
      _id: chat._id,
      client: {
        _id: chat.client._id,
        name: `${chat.client.firstName} ${chat.client.lastName}`,
        email: chat.client.email,
      },
      unreadMessagesCount: unreadMessagesCount,
      messages: chat.message.map((m) => ({
        _id: m._id,
        value: m.value,
        owner: m.owner,
        createdAt: m.createdAt,
        isRead: m.isRead,
        isMine: role == process.env.SUP_ADMIN && m.owner.name == "Support",
      })),
    };

    return res.status(200).json(result);
  } catch (err) {
    await logger(req, "Error", err);
    console.log("An error occured");
    console.log(err);
    return res.status(500).json("An error occured");
  }
});

function getConnectedUser(id) {
  if (id != process.env.SUP_ADMIN) {
    var res = myCache.get("ConnectedUser") ?? [];
    return res.filter((f) => f.user.usid == id)[0];
  } else {
    var res = myCache.get("ConnectedUser") ?? [];
    return res.filter((f) => f.user.role == process.env.SUP_ADMIN)[0];
  }
}

router.post("/send/:toUserId", async (req, res) => {
  try {
    const { role, usid } = req.user;
    const { toUserId } = req.params;
    const { message } = req.body;
    let _toUserId = mongoose.Types.ObjectId(toUserId);
    let _userId = mongoose.Types.ObjectId(usid);
    let _user = await User.findOne({ _id: _userId });

    const io = req.app.get("socketio"); //Here you use the exported socketio module
    let userTo = getConnectedUser(_toUserId);

    let addedMessage = {
      chatId: userTo?.id,
      value: message,
      createdAt: Date.now(),
      owner: {
        _id: _userId,
        name: "Support",
      },
      isRead: false,
      isMine: false,
    };

    let existChat = await Chat.findOne({ client: _toUserId });
    if (existChat) {
      existChat.message.push(addedMessage);
      existChat.save();
    } else {
      existChat = await Chat.create({
        client: client,
        message: addedMessage,
      });
    }

    let result = {
      _id: existChat._id,
      client: {
        _id: _user._id,
        name: _user.firstName + " " + _user.lastName,
      },
      messages: [addedMessage],
    };
    io.to(userTo?.id).emit("message", result);
    return res.status(201).json(result);
  } catch (err) {
    await logger(req, "Error", err);

    console.log("An error occured");
    console.log(err);
    return res.status(500).json("An error occured");
  }
});

router.post("/send-to-support", async (req, res) => {
  try {
    const { usid } = req.user;
    const { message } = req.body;
    let _userId = mongoose.Types.ObjectId(usid);
    let _user = await User.findOne({ _id: _userId });

    const io = req.app.get("socketio"); //Here you use the exported socketio module
    let adminTo = getConnectedUser(process.env.SUP_ADMIN);

    let addedMessage = {
      chatId: adminTo?.id,
      value: message,
      createdAt: Date.now(),
      owner: {
        _id: _user._id,
        name: _user.firstName + " " + _user.lastName,
      },
      isRead: false,
      isMine: false,
    };

    let existChat = await Chat.findOne({ client: _userId });
    if (existChat) {
      existChat.message.push(addedMessage);
      existChat.save();
    } else {
      existChat = await Chat.create({
        client: _userId,
        message: addedMessage,
      });
    }

    let result = {
      _id: existChat._id,
      client: {
        _id: _user._id,
        name: _user.firstName + " " + _user.lastName,
      },
      messages: [addedMessage],
    };

    io.to(adminTo?.id).emit("message", result);
    return res.status(201).json(result);
  } catch (err) {
    await logger(req, "Error", err);

    console.log("An error occured");
    console.log(err);
    return res.status(500).json("An error occured");
  }
});

module.exports = router;

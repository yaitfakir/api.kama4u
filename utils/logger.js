const Log = require("../models/Log");

const logger = async (req, type, error) => {
  try {
    const token = req?.headers?.authorization?.split(" ")[1];

    const log = await Log.create({
      type: type,
      error: error,
      headers: req?.headers,
      body: req?.body,
      params: req?.params,
      token: token,
      status: "pending",
    });
    console.log("Logger", log);
  } catch (error) {
    console.log(error);
  }
};

module.exports = logger;

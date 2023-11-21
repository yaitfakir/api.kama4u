const jwt = require("jsonwebtoken");

const authSocketMiddleware = (socket, next) => {
  // since you are sending the token with the query
  const token = socket.handshake.query?.token;
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    socket.user = decoded;
  } catch (err) {
    return next(new Error("NOT AUTHORIZED"));
  }
  next();
};

module.exports = authSocketMiddleware;

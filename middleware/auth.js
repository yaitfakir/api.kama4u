const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  var token = req.headers.authorization;

  if (token) token = token.split(" ")[1];

  if (!token) {
    return res.status(403).json("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    req.user = decoded;
  } catch (err) {
    return res.status(401).json("Invalid Token");
  }
  return next();
};

module.exports = verifyToken;

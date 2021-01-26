const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const token = req.header("Authorization");
  if (!token) res.status(401).send("Access Denied. No Token Provided");

  try {
    const decoded = jwt.verify(token, "jwtPrivateKey");
    req.user = decoded;
    if (next) {
      next();
    }
  } catch (ex) {
    res.status(400).send("Invalid Token");
  }
}

module.exports = auth;

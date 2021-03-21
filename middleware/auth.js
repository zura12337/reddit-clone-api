const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const token = req.cookies.token;
  if (!token) res.status(401).send("Access Denied");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    if (next) {
      next();
    }
  } catch (ex) {
    res.status(400);
  }
}

module.exports = auth;

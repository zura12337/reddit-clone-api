const express = require("express");
const mongoose = require("mongoose");
const posts = require("./routes/posts");
const users = require("./routes/users");
const community = require("./routes/community");
const auth = require("./routes/auth");
var cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();

app.use(cookieParser());
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(function (req, res, next) {
  res.header("Content-Type", "application/json;charset=UTF-8");
  res.header("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

mongoose.connect(
  "mongodb+srv://zura12337:Zuriko04@cluster0.j5rlw.mongodb.net/reddit",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

app.use("/api/posts", posts);
app.use("/api/users", users);
app.use("/api/community", community);
app.use("/api/auth", auth);

const port = 4000;
const server = app.listen(port, () => {
  console.log("Listening on port " + port + "...");
});

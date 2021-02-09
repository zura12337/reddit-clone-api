const express = require("express");
const mongoose = require("mongoose");
const posts = require("./routes/posts");
const users = require("./routes/users");
const community = require("./routes/community");
const auth = require("./routes/auth");
const images = require("./routes/images");
var cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();

app.use(cookieParser());
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

mongoose.connect(
  "mongodb+srv://zura12337:Zuriko04@cluster0.j5rlw.mongodb.net/reddit",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

app.use("/api/posts", posts);
app.use("/api/users", users);
app.use("/api/community", community);
app.use("/api/auth", auth);
app.use("/api/images/", images);

const port = 4000;
const server = app.listen(port, () => {
  console.log("Listening on port " + port + "...");
});

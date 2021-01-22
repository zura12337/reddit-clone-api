const express = require("express");
const mongoose = require("mongoose");
const posts = require("./routes/posts");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(
  "mongodb+srv://zura12337:<password>@cluster0.j5rlw.mongodb.net/reddit",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

app.use("/api/posts", posts);

const port = 4000;
const server = app.listen(port, () => {
  console.log("Listening on port " + port + "...");
});

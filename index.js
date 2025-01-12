// server.js
var express = require("express"),
  engine = require("ejs-mate"),
  app = express();
const path = require("path");
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/eventPlanning");

const bodyParser = require("body-parser");
app.engine("ejs", engine);

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json()); // For parsing application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname, "public"))); // Static files

app.get("/", (req, res) => {
  console.log("Index.ejs is loading...");
  res.render("index.ejs");
});

app.get("/login", (req, res) => {
  console.log("login.ejs is loading...");
  res.render("auth/login.ejs");
});

app.get("/signup", (req, res) => {
  console.log("signup.ejs is loading...");
  res.render("auth/signup.ejs");
});
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

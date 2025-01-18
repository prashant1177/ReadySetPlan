// server.js
var express = require("express"),
  engine = require("ejs-mate"),
  app = express();
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const session = require("express-session");

mongoose.connect("mongodb://localhost:27017/eventPlanning");

const bodyParser = require("body-parser");
app.engine("ejs", engine);

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json()); // For parsing application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname, "public"))); // Static files

app.use(session({
  secret: "secretkey", // You can change this to a more secure key
  resave: false,
  saveUninitialized: true,
}));

// Schemas
const User = require("./models/User"); 

app.use((req, res, next) => {
  res.locals.user = req.session.user || null; // Attach user to locals, or null if not logged in
  next();
});
app.get("/", (req, res) => {
  // console.log("Index.ejs is loading...");
  res.render("index.ejs" );
});

app.get("/logout", (req, res) => {
  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Error during logout");
    }
    // Redirect to the homepage after logout
    res.redirect("/");
  });
});

app.get("/login", (req, res) => {
  // console.log("login.ejs is loading...");
  res.render("auth/login.ejs");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).render("auth/login", { error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).render("auth/login", { error: "Invalid credentials" });
    }

    console.log("Login User Email: " + email);
    req.session.user = user;
    res.redirect("/"); // Redirect to home or dashboard on successful login
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


app.get("/signup", (req, res) => {
  // console.log("signup.ejs is loading...");
  res.render("auth/signup.ejs");
});

app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).render("auth/signup", { error: "User already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    res.redirect("/login");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

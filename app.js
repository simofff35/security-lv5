const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
//sessions and passport
app.use(
  session({
    secret: "our little secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
//**Database */
mongoose.connect("mongodb://127.0.0.1:27017/sessiondb");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: String,
});
userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//routes
app.get("/register", (req, res, next) => {
  res.render("register");
});

app.post("/register", (req, res, next) => {
  User.register(
    { username: req.body.username },
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        res.redirect("register");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.render("secrets");
        });
      }
    }
  );
});

app.get("/secret", (req, res, next) => {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.render("register");
  }
});

app.get("/login", (req, res, next) => {
  res.render("login");
});
app.post("/login", (req, res, next) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, (err) => {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/secret");
      });
    }
  });
});

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/login");
    }
  });
});

app.listen(3000);

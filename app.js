require("dotenv").config(); // This makes .env file available to "process"
const express = require("express");
const path = require("path");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oidc");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const cors = require("cors");
const bcrypt = require("bcryptjs");

const mongoDb =
  "mongodb+srv://sevaleonov:0Gp3XV96NbAIr5C6@cluster0.zjlmdta.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoDb);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

const User = mongoose.model(
  "User",
  new Schema({
    username: { type: String, required: true },
    password: { type: String, required: false },
    googleId: { type: String, required: false },
  })
);

const app = express();
// app.use(cors());

// Allow credentials (cookies, authorization headers, etc.)
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env["GOOGLE_CLIENT_ID"],
      clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
      callbackURL: "/oauth2/redirect/google",
      scope: ["profile"],
    },

    async (issuer, profile, done) => {
      try {
        console.log(issuer);
        console.log(profile);
        let user = await User.findOne({ googleId: profile.id });
        if (!user) {
          user = new User({
            username: profile.displayName,
            googleId: profile.id,
          });
          await user.save();
        }
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// passport.serializeUser((user, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findById(id);
//     done(null, user);
//   } catch (err) {
//     done(err);
//   }
// });
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, { id: user.id, username: user.username, name: user.name });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

app.set("views", __dirname);
app.set("view engine", "ejs");

// app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({ db: "sessions.db", dir: "./var" }),
  })
);
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

// Parses incoming request bodies with JSON payloads
app.use(express.json());

app.get("/", (req, res) => {
  res.render("index", { user: req.user });
});
app.get("/sign-up", (req, res) => {
  console.log(req);
  console.log(res);

  res.render("sign-up-form");
});

app.get("/login/federated/google", (req, res, next) => {
  //   console.log(req.query.redirect);
  passport.authenticate("google")(req, res, next);
});

app.get(
  "/oauth2/redirect/google",
  passport.authenticate("google", {
    successRedirect: "/redirect",
    failureRedirect: "/redirect",
  })
);

app.get("/redirect", async (req, res, next) => {
  res.redirect("http://localhost:5173/");
});

app.post("/sign-up", async (req, res, next) => {
  try {
    if (req.body.username === "") {
      return res.status(409).json({ message: "Username missing" });
    }
    if (req.body.password === "") {
      return res.status(409).json({ message: "Password missing" });
    }
    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      const newUser = new User({
        username: req.body.username,
        password: hashedPassword,
      });
      const user = await User.findOne({ username: req.body.username });
      if (!user) {
        const result = await newUser.save();
        res.redirect("/");
      } else {
        return res.status(409).json({ message: "Username exists" });
      }
    });
  } catch (err) {
    return next(err);
  }
});

app.post("/login/password", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res
        .status(401)
        .json({ message: info.message || "Incorrect username or password" });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.status(200).json({ user: user });
    });
  })(req, res, next);
});

app.get("/check-login", (req, res) => {
  console.log(`check-login: ${req.isAuthenticated()}`);
  if (req.isAuthenticated()) {
    // User is logged in
    res.locals.currentUser = req.user;
    res.status(200).json({
      isLoggedIn: true,
      user: req.user,
    });
  } else {
    // User is not logged in
    res.status(200).json({ isLoggedIn: false });
  }
});

app.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    // res.redirect("/");
    res.status(200).send("Logged out successfully.");
  });
  console.log(req);
});

app.listen(3001, () => console.log("app listening on port 3001!"));

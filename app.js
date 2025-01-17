require("dotenv").config();
const express = require("express");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const mongoose = require("mongoose");
const cors = require("cors");
const indexRouter = require("./routes/index");
const path = require("path");
const passport = require("./helpers/passportInitializer");

// Database setup
const mongoDb = process.env["MONGO_DB"];
mongoose.connect(mongoDb);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

const app = express();

// Allow credentials (cookies, authorization headers, etc.)
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://yogato.netlify.app",
    "https://yogato.adaptable.app/",
  ],
  methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
  credentials: true,
};

app.options("/verify-token", cors(corsOptions));

app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// View engine setup
app.set("views", __dirname);
app.set("views", path.join(__dirname, "views"));

app.set("view engine", "ejs");
app.set("trust proxy", 1);

const sessionConfig = {
  secret: "keyboard cat",
  resave: false,
  saveUninitialized: false,
  store: new SQLiteStore({ db: "sessions.db", dir: "./var" }),
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 3 * 24 * 60 * 60 * 1000,
  },
};

if (process.env.NODE_ENV === "production") {
  sessionConfig.cookie.sameSite = "none";
}

app.use(session(sessionConfig));

app.use(passport.session());

// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "https://yogato.netlify.app"); // update to match the domain you will make the request from
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept"
//   );
//   res.header("Access-Control-Allow-Credentials", true); // allows cookie to be sent
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, HEAD, DELETE"); // you must specify the methods used with credentials. "*" will not work.
//   next();
// });

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/", indexRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});

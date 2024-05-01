require("dotenv").config();
const express = require("express");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const mongoose = require("mongoose");
const cors = require("cors");
const indexRouter = require("./routes/index");
const path = require("path");

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

app.options("*", cors(corsOptions));

app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// View engine setup
app.set("views", __dirname);
app.set("views", path.join(__dirname, "views"));

app.set("view engine", "ejs");
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({ db: "sessions.db", dir: "./var" }),
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: "none",
    },
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/", indexRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("app listening on port 3001!"));

require("dotenv").config();
const express = require("express");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const mongoose = require("mongoose");
const cors = require("cors");
const indexRouter = require("./routes/index");

// Database setup
const mongoDb =
  "mongodb+srv://sevaleonov:0Gp3XV96NbAIr5C6@cluster0.zjlmdta.mongodb.net/userData?retryWrites=true&w=majority&appName=Cluster0";
mongoose.connect(mongoDb);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

const app = express();

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

// View engine setup
app.set("views", __dirname);
app.set("view engine", "ejs");
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new SQLiteStore({ db: "sessions.db", dir: "./var" }),
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/", indexRouter);

app.listen(3001, () => console.log("app listening on port 3001!"));

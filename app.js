const express = require("express");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const flash = require("express-flash");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { exec } = require("child_process");
dotenv.config();

const app = express();
const port = 3000;

// Database connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(cors((req, callback) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "https://full-frontend-project.vercel.app",
  ];
  const origin = req.header("Origin");
  if (allowedOrigins.includes(origin)) {
    callback(null, { origin: true, credentials: true });
  } else {
    callback(null, { origin: false });
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to `true` if using HTTPS
  })
);

app.use(flash());

// Routes
const RegisterRouter = require("./routes/Register");
const LoginRouter = require("./routes/Login");
const passwordResetRouter = require("./routes/passwordReset");
const FormRouter = require("./routes/Form");
const uploadImage = require("./routes/Uploadimage");
const Imagefetch = require("./routes/Imagefetch");

app.use("/", RegisterRouter);
app.use("/", LoginRouter);
app.use("/", passwordResetRouter);
app.use("/", FormRouter);
app.use("/", uploadImage);
app.use("/", Imagefetch);

// Catch-all for 404 errors
app.use((req, res, next) => {
  res.status(404).render("404", { errorCode: 404, message: "Page Not Found" });
});

// Start server
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Periodic restart logic
setTimeout(() => {
  console.log("Restarting server to keep Render package active...");
  exec("node app.js", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error restarting server: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Standard error: ${stderr}`);
      return;
    }
    console.log(stdout);
    process.exit(0); // Exit the current process after restarting
  });
}, 60 * 1000); // Restart every 60 seconds

const express = require("express");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const flash = require("express-flash");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
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
app.use(
  cors({
    origin: ["http://localhost:5173"], // Replace with your frontend's hosted URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow cookies and credentials
  })
);


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
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});









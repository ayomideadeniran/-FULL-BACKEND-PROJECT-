const express = require("express");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const flash = require("express-flash");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cluster = require("cluster");
const os = require("os");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

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
    origin: [
      "http://localhost:5173", // Local frontend for development
      "https://full-frontend-project.vercel.app", // Deployed frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
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
    cookie: { secure: false }, // Set `secure: true` if using HTTPS
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

// Health check route for uptime services like UptimeRobot
app.get("/", (req, res) => {
  console.log("Health check ping received at:", new Date().toISOString());
  res.status(200).send("Server is up and running!");
});

// Catch-all for 404 errors
app.use((req, res, next) => {
  res.status(404).render("404", { errorCode: 404, message: "Page Not Found" });
});

// If we are the master process, we fork worker processes
if (cluster.isMaster) {
  const numCPUs = os.cpus().length;

  // Fork workers based on available CPU cores
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Graceful shutdown mechanism
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork(); // Restart the worker that died
  });

  // Restart a worker every 2 minutes without affecting other workers
  setInterval(() => {
    console.log("Gracefully restarting worker...");
    const worker = cluster.fork();
    setTimeout(() => {
      worker.kill();
    }, 5000); // Allow 5 seconds for graceful shutdown before killing the worker
  }, 2 * 60 * 1000); // Every 2 minutes

} else {
  // Worker process (your app code)
  app.listen(port, () => {
    console.log(`Worker ${process.pid} is running on port ${port}`);
  });
}

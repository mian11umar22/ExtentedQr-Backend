const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

// Environment config
dotenv.config();

// Middleware and view setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));
app.use(cors());
app.use("/qrcodes", express.static(path.join(__dirname, "public/qrcodes")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const EmployeeRoute = require("./Routes/EmployeeRoute");
const TemplateRoute = require("./Routes/TemplateRoute");
const qrRoutes = require("./Routes/qr");
app.use("/employee", EmployeeRoute);
app.use("/", TemplateRoute);
app.use("/", qrRoutes);

// Database connection
mongoose
  .connect(process.env.DB_HOST)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error(err));

// Railway dynamic port handling
const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server connected to port ${port}`);
});

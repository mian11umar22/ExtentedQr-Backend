const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "Views"));
app.use(express.static("public"));
app.use(cors());
app.use("/qrcodes", express.static(path.join(__dirname, "public/qrcodes")));
const EmployeeRoute = require("./Routes/EmployeeRoute");
const TemplateRoute = require("./Routes/TemplateRoute");
const qrRoutes = require("./Routes/qr");
dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/employee", EmployeeRoute);
app.use("/", TemplateRoute);
app.use("/qr", qrRoutes);
const port = process.env.PORT || 3000;
mongoose.connect(process.env.DB_HOST).then(console.log("Connected to mongodb"));
app.listen(port, () => {
  console.log(`Server Connected to port ${port}`);
});

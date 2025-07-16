const express = require("express");
const app = express();
const router = express.Router();
const { FakeData, getEmployees,createEmployee } = require("../Controllers/EmployeeController");
/*router.get("/employees",FakeData);*/
router.get("/", getEmployees);
router.post("/create", createEmployee);
module.exports = router;

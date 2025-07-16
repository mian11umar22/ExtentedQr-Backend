const Employee = require("../Modals/EmployeeModal");
const FakeData = async (req, res) => {
  try {
    await Employee.create([
      {
        employeeId: 1001,
        Name: "Umar",
        Email: "umar@example.com",
        Department: "Finance",
      },
      {
        employeeId: 1002,
        Name: "Arsalan",
        Email: "arsalan@example.com",
        Department: "IT",
      },
      {
        employeeId: 1003,
        Name: "Muneeb",
        Email: "muneeb@example.com",
        Department: "HR",
      },
      {
        employeeId: 1004,
        Name: "Waseem",
        Email: "waseem@example.com",
        Department: "Marketing",
      },
      {
        employeeId: 1005,
        Name: "Ali",
        Email: "ali@example.com",
        Department: "Operations",
      },
      {
        employeeId: 1006,
        Name: "Bilal",
        Email: "bilal@example.com",
        Department: "Finance",
      },
      {
        employeeId: 1007,
        Name: "Hamza",
        Email: "hamza@example.com",
        Department: "IT",
      },
      {
        employeeId: 1008,
        Name: "Tariq",
        Email: "tariq@example.com",
        Department: "Logistics",
      },
      {
        employeeId: 1009,
        Name: "Saad",
        Email: "saad@example.com",
        Department: "Legal",
      },
      {
        employeeId: 1010,
        Name: "Zain",
        Email: "zain@example.com",
        Department: "Procurement",
      },
    ]);
    res.status(200).json({
      message: "Data added",
    });
    console.log("✅ 10 employees added successfully!");
  } catch (err) {
    console.error("❌ Error inserting employees:", err);
  }
};
const getEmployees = async (req, res) => {
  const Employees = await Employee.find();
  res.status(200).json({
    message: "Employees Displayed",
    data: Employees,
  });
};
const createEmployee = async (req, res) => {
  try {
    const count = await Employee.countDocuments();
    const newEmployee = new Employee({
      employeeId: 1000 + count + 1,
      Name: req.body.Name,
      Email: req.body.Email,
      Department: req.body.Department,
    });
    await newEmployee.save();
    res.status(200).json({
      message: "Employee Added",
      data: newEmployee,
    });
  } catch (err) {
    res.status(400).json({
      error: err.message,
    });
  }
};
module.exports = { FakeData, getEmployees, createEmployee };

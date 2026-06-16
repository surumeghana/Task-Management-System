const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const User = require("./users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyToken = require("./authMiddleware");
const connectDB = require("./config/db");
const Task = require("./task");

dotenv.config();

connectDB();

const app = express();

app.use(express.json());
app.use(cors());
app.post("/register", async (req, res) => {
  try {

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User Registered Successfully",
      user
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
});
app.post("/login", async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User Not Found"
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Password"
      });
    }

    const token = jwt.sign(
      { id: user._id },
      "mysecretkey",
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login Successful",
      token
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
});
// Protected Route
app.get("/profile", verifyToken, (req, res) => {

    res.json({
        message: "Welcome",
        user: req.user
    });

});
app.post("/tasks", verifyToken, async (req, res) => {

    const task = await Task.create({
        title: req.body.title,
        description: req.body.description,
        priority: req.body.priority,
        dueDate: req.body.dueDate,
        user: req.user.id
    });

    res.json(task);
});
app.get("/tasks", verifyToken, async (req, res) => {

    const tasks = await Task.find({
        user: req.user.id
    });

    res.json(tasks);

});
app.put("/tasks/:id", verifyToken, async (req, res) => {

    const task = await Task.findOneAndUpdate(
        {
            _id: req.params.id,
            user: req.user.id
        },
        req.body,
        { new: true }
    );

    res.json(task);

});
app.delete("/tasks/:id", verifyToken, async (req, res) => {

    await Task.findOneAndDelete({
        _id: req.params.id,
        user: req.user.id
    });

    res.json({
        message: "Task Deleted Successfully"
    });

});
app.listen(5000, () => {
  console.log("Server Running");
});
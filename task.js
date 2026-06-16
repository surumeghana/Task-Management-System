const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,

  status: {
    type: String,
    default: "Pending"
  },

  priority: {
    type: String,
    default: "Medium"
  },

  dueDate: Date,

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});

module.exports = mongoose.model("Task", taskSchema);
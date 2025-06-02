const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();
const Task = require('./models/task'); // Adjust the path as necessary

const cors = require('cors');
app.use(cors({ origin: 'http://localhost:3000' }));

// app.listen(3000, () => {
//   console.log("Server is running on localhost http://localhost:3000");
// });

app.use(express.json()); // Middleware to parse JSON bodies
// app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies

app.post("/api/tasks", (req, res) => {
  // res.send("Task created");
  const task = req.body;
  if (!task.title || !task.description) {
    return res.status(400).json({ message: "Title and description are required" , success: false });
  }
  const newTask = new Task(task);
  try{
    newTask.save();
    res.status(201).json({ message: "Task created successfully", success: true });
  }catch(err){
    console.error("error creating task:", err.message);
    res.status(500).json({ message: "Internal server error" , success: false });
  }
    
});

app.get("/api/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    console.error("Error fetching tasks:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  const taskId = req.params.id;
  try {
    const task = await Task.findByIdAndDelete(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Error deleting task:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/tasks', require('./routes/taskRoutes'));
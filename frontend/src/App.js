import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);

  // Fetch tasks
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/tasks")
      .then((res) => {
        console.log("Fetched tasks:", res.data);
        setTasks(res.data);
      })
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting:", { title, description, editId });
    
    if (editId) {
      // Update task
      try {
        const res = await axios.put(
          `http://localhost:5000/api/tasks/${editId}`,
          { title, description }
        );
        console.log("Update response:", res.data);
        setTasks(tasks.map((task) => (task._id === editId ? res.data : task)));
        setEditId(null);
      } catch (err) {
        console.error("Update error:", err.message, err.response?.data);
      }
    } else {
      // Create task
      try {
        const res = await axios.post(`http://localhost:5000/api/tasks`, {
          title,
          description,
        });
        
        console.log("Create response:", res.data);
        
        // Handle different possible response structures
        let newTask;
        if (res.data.data) {
          // If your backend returns { success: true, data: taskObject }
          newTask = res.data.data;
        } else if (res.data.task) {
          // If your backend returns { task: taskObject }
          newTask = res.data.task;
        } else {
          // If your backend returns the task object directly
          newTask = res.data;
        }
        
        // Ensure the task has an _id (required for React key and other operations)
        if (!newTask._id) {
          console.error("Created task doesn't have _id:", newTask);
          // Fallback: refetch all tasks
          const fetchRes = await axios.get("http://localhost:5000/api/tasks");
          setTasks(fetchRes.data);
        } else {
          // Add the new task to the existing tasks
          setTasks(prevTasks => [...prevTasks, newTask]);
          console.log("Added new task to state:", newTask);
        }
        
      } catch (err) {
        console.error("Create error:", err.message, err.response?.data);
      }
    }
    
    // Clear form
    setTitle("");
    setDescription("");
  };

  // Handle edit
  const handleEdit = (task) => {
    console.log("Editing task:", task._id);
    setEditId(task._id);
    setTitle(task.title);
    setDescription(task.description);
  };

  // Handle delete
  const handleDelete = async (id) => {
    console.log("Deleting task with ID:", id);
    if (!id) {
      console.error("Task ID is undefined, cannot delete");
      return;
    }
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${id}`);
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (err) {
      console.error("Delete error:", err.message, err.response?.data);
    }
  };

  // Toggle completion
  const handleToggleComplete = async (task) => {
    console.log("Toggling task:", task._id, "to completed:", !task.completed);
    try {
      const res = await axios.put(
        `http://localhost:5000/api/tasks/${task._id}`,
        {
          ...task,
          completed: !task.completed,
        }
      );
      console.log("Toggle response:", res.data);
      setTasks(tasks.map((t) => (t._id === task._id ? res.data : t)));
    } catch (err) {
      console.error("Toggle error:", err.message, err.response?.data);
    }
  };

  return (
    <div className="container">
      <h1>Task Manager</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Task Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <button type="submit">{editId ? "Update Task" : "Add Task"}</button>
      </form>
      <ul>
        {tasks.map((task) => (
          <li key={task._id} className={task.completed ? "completed" : ""}>
            <input
              type="checkbox"
              checked={task.completed || false}
              onChange={() => handleToggleComplete(task)}
            />
            <span>
              {task.title}: {task.description}
            </span>
            <button onClick={() => handleEdit(task)}>Edit</button>
            <button onClick={() => handleDelete(task._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
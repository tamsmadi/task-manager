import React, { useState, useEffect } from "react";
    import axios from "axios";
    import { Plus, Edit3, Trash2, Check, X, Calendar, Clock } from "lucide-react";
    import styles from "./App.module.css";

    const App = () => {
      const BASE_URL = "https://task-manager-d9h9.onrender.com/api/tasks";
      const [tasks, setTasks] = useState([]);
      const [title, setTitle] = useState("");
      const [description, setDescription] = useState("");
      const [editId, setEditId] = useState(null);
      const [filter, setFilter] = useState("all");

      // Fetch tasks on component mount
      useEffect(() => {
        axios.get(BASE_URL)
          .then(res => {
            console.log('Fetched tasks:', res.data);
            setTasks(res.data);
          })
          .catch(err => console.error('Fetch error:', err));
      }, []);

      // Handle form submission
      const handleSubmit = async () => {
        if (!title.trim() || !description.trim()) return;

        if (editId) {
          // Update task
          try {
            const res = await axios.put(`${BASE_URL}/${editId}`, { title, description });
            console.log('Update response:', res.data);
            setTasks(tasks.map(task => task._id === editId ? res.data : task));
            setEditId(null);
          } catch (err) {
            console.error('Update error:', err.message, err.response?.data);
          }
        } else {
          // Create task
          try {
            const res = await axios.post(BASE_URL, { title, description });
            console.log('Create response:', res.data);
            setTasks([...tasks, res.data]);
          } catch (err) {
            console.error('Create error:', err.message, err.response?.data);
          }
        }

        // Clear form
        setTitle("");
        setDescription("");
      };

      // Handle edit
      const handleEdit = (task) => {
        setEditId(task._id);
        setTitle(task.title);
        setDescription(task.description);
      };

      // Handle delete
      const handleDelete = async (id) => {
        try {
          await axios.delete(`${BASE_URL}/${id}`);
          setTasks(tasks.filter(task => task._id !== id));
        } catch (err) {
          console.error('Delete error:', err.message, err.response?.data);
        }
      };

      // Toggle completion
      const handleToggleComplete = async (task) => {
        try {
          const res = await axios.put(`${BASE_URL}/${task._id}`, {
            ...task,
            completed: !task.completed,
          });
          console.log('Toggle response:', res.data);
          setTasks(tasks.map(t => t._id === task._id ? res.data : t));
        } catch (err) {
          console.error('Toggle error:', err.message, err.response?.data);
        }
      };

      // Cancel edit
      const handleCancelEdit = () => {
        setEditId(null);
        setTitle("");
        setDescription("");
      };

      // Filter tasks
      const filteredTasks = tasks.filter(task => {
        if (filter === "completed") return task.completed;
        if (filter === "pending") return !task.completed;
        return true;
      });

      // Format date
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = now - date;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
      };

      const completedCount = tasks.filter(task => task.completed).length;
      const totalCount = tasks.length;

      return (
        <div className={styles.container}>
          <div className={styles.innerContainer}>
            {/* Header */}
            <div className={styles.header}>
              <h1 className={styles.title}>Task Manager</h1>
              <p className={styles.subtitle}>Stay organized and boost your productivity</p>

              {/* Stats */}
              <div className={styles.statsContainer}>
                <div className={styles.statCard}>
                  <div className={`${styles.statNumber} ${styles.total}`}>{totalCount}</div>
                  <div className={styles.statLabel}>Total Tasks</div>
                </div>
                <div className={styles.statCard}>
                  <div className={`${styles.statNumber} ${styles.completed}`}>{completedCount}</div>
                  <div className={styles.statLabel}>Completed</div>
                </div>
                <div className={styles.statCard}>
                  <div className={`${styles.statNumber} ${styles.pending}`}>{totalCount - completedCount}</div>
                  <div className={styles.statLabel}>Pending</div>
                </div>
              </div>
            </div>

            {/* Task Form */}
            <div className={styles.formCard}>
              <div className={styles.formGroup}>
                <input
                  type="text"
                  placeholder="What needs to be done?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <textarea
                  placeholder="Add a description (optional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={styles.textarea}
                />
              </div>
              <div className={styles.buttonContainer}>
                <button onClick={handleSubmit} className={styles.primaryButton}>
                  <Plus size={20} />
                  {editId ? "Update Task" : "Add Task"}
                </button>
                {editId && (
                  <button onClick={handleCancelEdit} className={styles.secondaryButton}>
                    <X size={20} />
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className={styles.filterContainer}>
              <div className={styles.filterTabs}>
                {["all", "pending", "completed"].map((filterType) => (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`${styles.filterTab} ${filter === filterType ? styles.active : ''}`}
                  >
                    {filterType}
                  </button>
                ))}
              </div>
            </div>

            {/* Task List */}
            <div className={styles.tasksList}>
              {filteredTasks.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>✨</div>
                  <h3 className={styles.emptyTitle}>No tasks found</h3>
                  <p className={styles.emptyText}>
                    {filter === "all"
                      ? "Create your first task to get started!"
                      : `No ${filter} tasks at the moment.`}
                  </p>
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <div
                    key={task._id}
                    className={`${styles.taskCard} ${task.completed ? styles.completed : ''}`}
                  >
                    <div className={styles.taskContent}>
                      {/* Checkbox */}
                      <div
                        onClick={() => handleToggleComplete(task)}
                        className={`${styles.checkbox} ${task.completed ? styles.completed : ''}`}
                      >
                        {task.completed && <Check size={14} />}
                      </div>

                      {/* Task Content */}
                      <div className={styles.taskInfo}>
                        <h3 className={`${styles.taskTitle} ${task.completed ? styles.completed : ''}`}>
                          {task.title}
                        </h3>
                        <p className={`${styles.taskDescription} ${task.completed ? styles.completed : ''}`}>
                          {task.description}
                        </p>
                        <div className={styles.taskMeta}>
                          <div className={styles.taskMetaItem}>
                            <Calendar size={12} />
                            {formatDate(task.createdAt)}
                          </div>
                          <div className={styles.taskMetaItem}>
                            <Clock size={12} />
                            {task.completed ? "Completed" : "In Progress"}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className={styles.taskActions}>
                        <button
                          onClick={() => handleEdit(task)}
                          className={`${styles.actionButton} ${styles.edit}`}
                          title="Edit task"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(task._id)}
                          className={`${styles.actionButton} ${styles.delete}`}
                          title="Delete task"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      );
    };

    export default App;
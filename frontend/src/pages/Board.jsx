import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { getTasks, createTask, updateTask, deleteTask } from "../api/index.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const columns = ["todo", "inprogress", "done"];
const columnLabels = { todo: "To Do", inprogress: "In Progress", done: "Done" };

const Board = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "Medium",
    deadlineDate: "",
    deadlineTime: "",
  });
  const [showForm, setShowForm] = useState(false);
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return navigate("/login");
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const { data } = await getTasks();
    setTasks(data);
  };

  const handleCreate = async () => {
    if (!newTask.title) return;
    const deadline = newTask.deadlineDate
      ? new Date(`${newTask.deadlineDate}T${newTask.deadlineTime || "23:59"}`)
      : null;
    await createTask({ ...newTask, deadline });
    setNewTask({
      title: "",
      description: "",
      priority: "Medium",
      deadlineDate: "",
      deadlineTime: "",
    });
    setShowForm(false);
    fetchTasks();
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const { draggableId, source, destination } = result;
    if (source.droppableId === destination.droppableId) return;
    const newStatus = destination.droppableId;
    const columnLabel = {
      todo: "To Do",
      inprogress: "In Progress",
      done: "Done",
    };
    const confirmed = window.confirm(
      `Move task to "${columnLabel[newStatus]}"?`,
    );
    if (!confirmed) return;
    await updateTask(draggableId, { status: newStatus });
    fetchTasks();
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?",
    );
    if (!confirmed) return;
    await deleteTask(id);
    fetchTasks();
  };

  const getColumnTasks = (status) => tasks.filter((t) => t.status === status);

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  return (
    <div className="board-container">
      <div className="board-header">
        <h1>Kanban Board</h1>
        <div>
          <span>👤 {user?.username}</span>
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button
            onClick={() => {
              logoutUser();
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <button className="add-task-btn" onClick={() => setShowForm(!showForm)}>
        + Add Task
      </button>

      {showForm && (
        <div className="task-form">
          <input
            placeholder="Title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
          <textarea
            placeholder="Description"
            value={newTask.description}
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
          />
          <select
            value={newTask.priority}
            onChange={(e) =>
              setNewTask({ ...newTask, priority: e.target.value })
            }
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          <input
            type="date"
            placeholder="Deadline Date"
            title="Deadline Date"
            value={newTask.deadlineDate}
            onChange={(e) =>
              setNewTask({ ...newTask, deadlineDate: e.target.value })
            }
          />
          <input
            type="time"
            placeholder="Deadline Time"
            title="Deadline Time"
            value={newTask.deadlineTime}
            onChange={(e) =>
              setNewTask({ ...newTask, deadlineTime: e.target.value })
            }
          />
          <button onClick={handleCreate}>Create Task</button>
          <button onClick={() => setShowForm(false)}>Cancel</button>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="columns">
          {columns.map((col) => (
            <Droppable droppableId={col} key={col}>
              {(provided) => (
                <div
                  className="column"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  <h2>{columnLabels[col]}</h2>
                  {getColumnTasks(col).map((task, index) => (
                    <Draggable
                      key={task._id}
                      draggableId={task._id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          className={`task-card priority-${task.priority.toLowerCase()}`}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <h3>{task.title}</h3>
                          <p>{task.description}</p>
                          <span className="priority-badge">
                            {task.priority}
                          </span>
                          {task.deadline &&
                            (() => {
                              const deadline = new Date(task.deadline);
                              const compareTime =
                                task.status === "done" && task.endTime
                                  ? new Date(task.endTime)
                                  : new Date();
                              const isOverdue = deadline < compareTime;
                              const diffMs = compareTime - deadline;
                              const diffDays = Math.floor(
                                diffMs / (1000 * 60 * 60 * 24),
                              );
                              const diffHours = Math.floor(
                                (diffMs % (1000 * 60 * 60 * 24)) /
                                  (1000 * 60 * 60),
                              );
                              const diffMins = Math.floor(
                                (diffMs % (1000 * 60 * 60)) / (1000 * 60),
                              );

                              return (
                                <div
                                  style={{
                                    fontSize: "11px",
                                    color: "#94a3b8",
                                    marginBottom: "6px",
                                  }}
                                >
                                  <p>
                                    🕐 Created: {formatDate(task.createdAt)}
                                  </p>
                                  <p>
                                    📅 Deadline: {formatDate(task.deadline)}
                                  </p>
                                  {task.status === "done" && task.endTime && (
                                    <p>
                                      ✅ Completed: {formatDate(task.endTime)}
                                    </p>
                                  )}
                                  {isOverdue && (
                                    <p
                                      style={{
                                        color:
                                          task.status === "done"
                                            ? "#f59e0b"
                                            : "#ef4444",
                                      }}
                                    >
                                      ⚠️{" "}
                                      {task.status === "done"
                                        ? "Was overdue"
                                        : "Overdue"}{" "}
                                      by {diffDays}d {diffHours}h {diffMins}m
                                    </p>
                                  )}
                                </div>
                              );
                            })()}
                          {task.timeSpent > 0 &&
                            (() => {
                              const totalSecs = task.timeSpent;
                              const days = Math.floor(totalSecs / 86400);
                              const hours = Math.floor(
                                (totalSecs % 86400) / 3600,
                              );
                              const mins = Math.floor((totalSecs % 3600) / 60);
                              const parts = [];
                              if (days > 0) parts.push(`${days}d`);
                              if (hours > 0) parts.push(`${hours}h`);
                              if (mins > 0) parts.push(`${mins}m`);
                              if (parts.length === 0) parts.push("< 1m");
                              return <p>⏱️ Time spent: {parts.join(" ")}</p>;
                            })()}
                          <button onClick={() => handleDelete(task._id)}>
                            🗑️
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Board;

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
    deadline: "",
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
    await createTask(newTask);
    setNewTask({
      title: "",
      description: "",
      priority: "Medium",
      deadline: "",
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
            value={newTask.deadline}
            onChange={(e) =>
              setNewTask({ ...newTask, deadline: e.target.value })
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
                          {task.deadline && (
                            <p
                              className={`deadline ${new Date(task.deadline) < new Date() && task.status !== "done" ? "overdue" : ""}`}
                            >
                              📅 {new Date(task.deadline).toLocaleDateString()}
                              {new Date(task.deadline) < new Date() &&
                              task.status !== "done"
                                ? " ⚠️ Overdue"
                                : ""}
                            </p>
                          )}
                          {task.timeSpent > 0 && (
                            <p>⏱️ {Math.round(task.timeSpent / 60)} mins</p>
                          )}
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

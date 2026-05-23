import { useEffect, useState } from "react";
import { getTasks } from "../api/index.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#6366f1", "#f59e0b", "#10b981"];

const getComplexity = (task) => {
  const descLen = task.description?.length || 0;
  const time = task.timeSpent || 0;
  const priority = task.priority;

  if (priority === "High" || descLen > 100 || time > 3600) return "Hard";
  if (priority === "Medium" || descLen > 40 || time > 600) return "Moderate";
  return "Easy";
};

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return navigate("/login");
    getTasks().then(({ data }) => setTasks(data));
  }, []);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "done").length;
  const completionRate = total ? Math.round((completed / total) * 100) : 0;

  const doneTasks = tasks.filter((t) => t.status === "done" && t.timeSpent > 0);
  const avgTime = doneTasks.length
    ? Math.round(
        doneTasks.reduce((a, b) => a + b.timeSpent, 0) / doneTasks.length / 60,
      )
    : 0;
  const longestTask = doneTasks.length
    ? Math.round(Math.max(...doneTasks.map((t) => t.timeSpent)) / 60)
    : 0;
  const fastestTask = doneTasks.length
    ? Math.round(Math.min(...doneTasks.map((t) => t.timeSpent)) / 60)
    : 0;

  const productivityScore = total
    ? Math.round((completed / total) * 100 - (avgTime > 60 ? 10 : 0))
    : 0;

  const complexityData = [
    {
      name: "Easy",
      value: tasks.filter((t) => getComplexity(t) === "Easy").length,
    },
    {
      name: "Moderate",
      value: tasks.filter((t) => getComplexity(t) === "Moderate").length,
    },
    {
      name: "Hard",
      value: tasks.filter((t) => getComplexity(t) === "Hard").length,
    },
  ];

  const statusData = [
    { name: "To Do", value: tasks.filter((t) => t.status === "todo").length },
    {
      name: "In Progress",
      value: tasks.filter((t) => t.status === "inprogress").length,
    },
    { name: "Done", value: tasks.filter((t) => t.status === "done").length },
  ];

  const overdueCount = tasks.filter(
    (t) =>
      t.deadline && new Date(t.deadline) < new Date() && t.status !== "done",
  ).length;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>📊 Dashboard</h1>
        <button onClick={() => navigate("/board")}>← Back to Board</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Tasks</h3>
          <p>{total}</p>
        </div>
        <div className="stat-card">
          <h3>Completion Rate</h3>
          <p>{completionRate}%</p>
        </div>
        <div className="stat-card">
          <h3>Avg Time per Task</h3>
          <p>{avgTime} mins</p>
        </div>
        <div className="stat-card">
          <h3>Productivity Score</h3>
          <p>{productivityScore}</p>
        </div>
        <div className="stat-card">
          <h3>Longest Task</h3>
          <p>{longestTask} mins</p>
        </div>
        <div className="stat-card">
          <h3>Fastest Task</h3>
          <p>{fastestTask} mins</p>
        </div>
        <div className="stat-card overdue">
          <h3>Overdue Tasks</h3>
          <p>{overdueCount}</p>
        </div>
      </div>

      <div className="charts">
        <div className="chart-box">
          <h3>Task Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {statusData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h3>Task Complexity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={complexityData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

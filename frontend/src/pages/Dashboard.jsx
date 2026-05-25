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

const COLORS = ["#10b981", "#f59e0b", "#6366f1"];

const getComplexity = (task) => {
  const descLen = task.description?.length || 0;
  const time = task.timeSpent || 0;
  const priority = task.priority;
  if (priority === "High" || descLen > 100 || time > 3600) return "Hard";
  if (priority === "Medium" || descLen > 40 || time > 600) return "Moderate";
  return "Easy";
};

const getInsights = (tasks) => {
  const insights = [];
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "done");
  const overdueDone = completed.filter(
    (t) => t.deadline && new Date(t.deadline) < new Date(t.endTime),
  );
  const overdueActive = tasks.filter(
    (t) =>
      t.deadline && new Date(t.deadline) < new Date() && t.status !== "done",
  );
  const inProgress = tasks.filter((t) => t.status === "inprogress");
  const completionRate = total
    ? Math.round((completed.length / total) * 100)
    : 0;
  const hardTasks = tasks.filter((t) => getComplexity(t) === "Hard").length;
  const easyTasks = tasks.filter((t) => getComplexity(t) === "Easy").length;
  const doneTasks = completed.filter((t) => t.timeSpent > 0);
  const avgTime = doneTasks.length
    ? Math.round(
        doneTasks.reduce((a, b) => a + b.timeSpent, 0) / doneTasks.length / 60,
      )
    : 0;

  // Productivity
  if (completionRate >= 80 && overdueDone.length === 0) {
    insights.push({
      type: "success",
      icon: "🏆",
      text: "Excellent productivity! You complete tasks on time consistently.",
    });
  } else if (completionRate >= 50) {
    insights.push({
      type: "warning",
      icon: "💪",
      text: `You've completed ${completionRate}% of tasks. Push a little harder to hit 80%!`,
    });
  } else {
    insights.push({
      type: "danger",
      icon: "⚠️",
      text: `Only ${completionRate}% tasks completed. Focus on finishing pending tasks first.`,
    });
  }

  // Overdue completed
  if (overdueDone.length > 0) {
    insights.push({
      type: "warning",
      icon: "🕐",
      text: `${overdueDone.length} task${overdueDone.length > 1 ? "s were" : " was"} completed after the deadline. Try to plan better next time.`,
    });
  }

  // Active overdue
  if (overdueActive.length > 0) {
    insights.push({
      type: "danger",
      icon: "🚨",
      text: `${overdueActive.length} task${overdueActive.length > 1 ? "s are" : " is"} overdue and still not done. Act immediately!`,
    });
  } else if (total > 0) {
    insights.push({
      type: "success",
      icon: "✅",
      text: "No active overdue tasks. Great deadline management!",
    });
  }

  // Complexity
  if (hardTasks > total / 2) {
    insights.push({
      type: "warning",
      icon: "🧩",
      text: "Most of your tasks are complex. Consider breaking them into smaller subtasks.",
    });
  } else if (easyTasks > total / 2) {
    insights.push({
      type: "info",
      icon: "📈",
      text: "Most tasks are easy. Consider taking on more challenging work.",
    });
  }

  // In progress
  if (inProgress.length > 3) {
    insights.push({
      type: "warning",
      icon: "🔄",
      text: `${inProgress.length} tasks in progress simultaneously. Focus on finishing before starting new ones.`,
    });
  }

  // Time
  if (avgTime > 120) {
    insights.push({
      type: "warning",
      icon: "⏱️",
      text: `Average task takes ${avgTime} mins. Try to identify what's slowing you down.`,
    });
  } else if (avgTime > 0) {
    insights.push({
      type: "success",
      icon: "⚡",
      text: `Great pace! Average task completion time is ${avgTime} mins.`,
    });
  }

  return insights;
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
  const completed = tasks.filter((t) => t.status === "done");
  const completionRate = total
    ? Math.round((completed.length / total) * 100)
    : 0;

  const doneTasks = completed.filter((t) => t.timeSpent > 0);
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

  const overdueDone = completed.filter(
    (t) => t.deadline && new Date(t.deadline) < new Date(t.endTime),
  ).length;
  const overdueActive = tasks.filter(
    (t) =>
      t.deadline && new Date(t.deadline) < new Date() && t.status !== "done",
  ).length;

  const productivityScore = total
    ? Math.max(
        0,
        Math.round(
          (completed.length / total) * 100 -
            overdueDone * 10 -
            overdueActive * 5 -
            (avgTime > 120 ? 10 : 0),
        ),
      )
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
    { name: "Done", value: completed.length },
    {
      name: "In Progress",
      value: tasks.filter((t) => t.status === "inprogress").length,
    },
    { name: "To Do", value: tasks.filter((t) => t.status === "todo").length },
  ];

  const insights = getInsights(tasks);

  const insightColors = {
    success: { bg: "#064e3b", border: "#10b981", icon: "#10b981" },
    warning: { bg: "#451a03", border: "#f59e0b", icon: "#f59e0b" },
    danger: { bg: "#450a0a", border: "#ef4444", icon: "#ef4444" },
    info: { bg: "#1e1b4b", border: "#6366f1", icon: "#6366f1" },
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>📊 Dashboard</h1>
        <button onClick={() => navigate("/board")}>← Back to Board</button>
      </div>

      {/* Stats */}
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
          <p
            style={{
              color:
                productivityScore >= 70
                  ? "#10b981"
                  : productivityScore >= 40
                    ? "#f59e0b"
                    : "#ef4444",
            }}
          >
            {productivityScore}
          </p>
        </div>
        <div className="stat-card">
          <h3>Longest Task</h3>
          <p>{longestTask} mins</p>
        </div>
        <div className="stat-card">
          <h3>Fastest Task</h3>
          <p>{fastestTask} mins</p>
        </div>
        <div className="stat-card">
          <h3>Completed Late</h3>
          <p style={{ color: overdueDone > 0 ? "#f59e0b" : "#10b981" }}>
            {overdueDone}
          </p>
        </div>
        <div className="stat-card">
          <h3>Overdue Tasks</h3>
          <p style={{ color: overdueActive > 0 ? "#ef4444" : "#10b981" }}>
            {overdueActive}
          </p>
        </div>
      </div>

      {/* Charts */}
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
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insights */}
      <div style={{ marginBottom: "32px", marginTop: "32px" }}>
        {" "}
        <h2
          style={{
            color: "#94a3b8",
            marginBottom: "16px",
            fontSize: "16px",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          🤖 AI Insights
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {insights.map((insight, i) => (
            <div
              key={i}
              style={{
                background: insightColors[insight.type].bg,
                border: `1px solid ${insightColors[insight.type].border}`,
                borderRadius: "10px",
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontSize: "14px",
                color: "#e2e8f0",
              }}
            >
              <span style={{ fontSize: "20px" }}>{insight.icon}</span>
              <span>{insight.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

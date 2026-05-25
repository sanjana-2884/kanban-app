# 📋 Kanban Task Manager with Smart Insights Dashboard

A full-stack Kanban-based task management web application with an AI-like analytics dashboard that provides smart insights such as task completion rate, complexity analysis, time tracking, and productivity scoring.

---

## 🌐 Live Demo
**[https://kanban-app-six-jet.vercel.app](https://kanban-app-six-jet.vercel.app)**

---

## ✨ Features

### 🗂️ Kanban Board
- Three columns: **To Do**, **In Progress**, **Done**
- Drag and drop tasks between columns with confirmation popup
- Add tasks with title, description, priority, deadline date and time

### ⏱️ Task Tracking
- Timer automatically starts when task moves to **In Progress**
- Timer stops when task moves to **Done**
- Total time spent stored per task
- Shows created time, deadline, completed time on each task card

### 🤖 Smart AI-Like Insights (Rule-Based)
- **Completion Rate** — % of tasks completed
- **Task Complexity** — Heuristic based on description length, time taken, and priority
- **Time Analysis** — Average, longest, and fastest task completion times
- **Productivity Score** — Penalizes late completions and overdue tasks
- **Overdue Detection** — Shows how long a task was overdue in days, hours, minutes
- **AI Insights Panel** — Smart messages based on your task data

### 📊 Dashboard
- Total tasks, completion rate, avg time, productivity score
- Completed late count and active overdue count
- Pie chart — Task status distribution
- Bar chart — Task complexity distribution
- AI Insights — Personalized recommendations

### 🔐 User System
- Register and Login with JWT authentication
- Each user sees only their own board
- Passwords securely hashed with bcrypt

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express |
| Database | MongoDB Atlas, Mongoose |
| Auth | JWT, bcryptjs |
| Frontend | React 19, Vite, React Router DOM |
| Drag & Drop | @hello-pangea/dnd |
| Charts | Recharts |
| Deployment | Vercel (frontend), Render (backend) |

---

## 🎯 Bonus Features Implemented
- ✅ Charts (Pie + Bar) on dashboard
- ✅ Deadline tracking with overdue detection
- ✅ Overdue time shown in days, hours, minutes
- ✅ Delete confirmation popup
- ✅ Drag confirmation popup
- ✅ AI Insights panel with smart recommendations
- ✅ Productivity score penalizes late completions
- ✅ Multi-user support with isolated boards

---


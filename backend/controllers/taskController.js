import Task from "../models/Task.js";

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, priority, deadline } = req.body;
    const task = await Task.create({
      title,
      description,
      priority,
      deadline,
      user: req.user.id,
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.user.toString() !== req.user.id)
      return res.status(401).json({ message: "Not authorized" });

    const { status } = req.body;

    if (status === "inprogress" && task.status !== "inprogress") {
      req.body.startTime = new Date();
    }

    if (status === "done" && task.status !== "done") {
      req.body.endTime = new Date();
      if (task.startTime) {
        req.body.timeSpent = Math.round(
          (new Date() - new Date(task.startTime)) / 1000,
        );
      }
    }

    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });
    if (task.user.toString() !== req.user.id)
      return res.status(401).json({ message: "Not authorized" });

    await task.deleteOne();
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

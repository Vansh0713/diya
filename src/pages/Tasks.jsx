import { useState } from "react";
import useTasks from "../hooks/useTasks";

export default function Tasks() {
  const { tasks, addTask, deleteTask, toggleTask, xp } = useTasks();
  const [input, setInput] = useState("");

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">📋 Tasks</h1>

      {/* XP Badge */}
      <div className="mb-6">
        <span className="bg-primary text-white px-4 py-2 rounded-full shadow">
          XP: {xp}
        </span>
      </div>

      {/* Input */}
      <div className="flex gap-3 mb-8">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={() => {
            addTask(input);
            setInput("");
          }}
          className="bg-primary text-white px-6 py-3 rounded-xl shadow hover:scale-105 transition"
        >
          Add
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white/70 backdrop-blur-xl p-4 rounded-xl shadow-soft flex justify-between items-center hover:shadow-lg transition"
          >
            <span
              onClick={() => toggleTask(task.id)}
              className={`cursor-pointer text-lg ${
                task.completed ? "line-through text-gray-400" : ""
              }`}
            >
              {task.text}
            </span>

            <button
              onClick={() => deleteTask(task.id)}
              className="text-red-500 hover:scale-110 transition"
            >
              ❌
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}